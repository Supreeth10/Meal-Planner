/** @module Server */

// This will let us use our basic middlewares now, then transition to hooks later
import fastifyMiddie from "@fastify/middie";
import staticFiles from "@fastify/static";
import Fastify, { FastifyInstance } from "fastify";
import path from "path";
import { getDirName } from "./lib/helpers";
import logger from "./lib/logger";
import { planner_routes } from "./routes";
import DbPlugin from "./plugins/database";
import cors from "@fastify/cors";

/**
 * This is our main "Create App" function.  Note that it does NOT start the server, this only creates it
 * @function
 * @param useLogging Whether to log or not
 * @return  Promise<FastifyInstance>
 */
export async function buildApp(useLogging: boolean) {
	const app = useLogging
		? Fastify({
			// enables fancy logs and disabling them during tests
			logger,
		})
		: Fastify({ logger: false });

	try {
		await app.register(cors, {
			origin: (origin, cb) => {
				// If we're in dev mode, no CORS necessary, let *everything* pass
				if (import.meta.env.DEV) {
					cb(null, true);
					return;
				}
				const hostname = new URL(origin).hostname;
				// Otherwise check to see if hostnames match, or are local connections and allow those too
				if (
					hostname === "localhost" ||
					hostname === "127.0.0.1" ||
					hostname === import.meta.env.VITE_IP_ADDR
				) {
					//  Request from localhost will pass
					cb(null, true);
					return;
				}
				// Generate an error on other origins, disabling access
				cb(new Error("Not allowed"), false);
			},
		});

		// add express-like 'app.use' middleware support
		await app.register(fastifyMiddie);

		// add static file handling
		await app.register(staticFiles, {
			root: path.join(getDirName(import.meta), "../public"),
			prefix: "/public/",
		});

		// Adds all of our Router's routes to the app
		app.log.info("Registering routes");
		await app.register(planner_routes);

		// Connects to postgres
		app.log.info("Connecting to Database...");
		await app.register(DbPlugin);

		app.log.info("App built successfully.");
	} catch (err) {
		console.error(err);
		process.exit(1);
	}

	return app;
}

/**
 * This is what actively starts the server listening on a port
 *
 * @param app: FastifyInstance main server instance created in buildApp()
 * @return  Promise<void> When server closes
 */
export async function listen(app: FastifyInstance) {
	try {
		await app.listen(
			{
				// Config object is optional and defaults to { host: 'localhost', port: 3000 }
				host: import.meta.env.VITE_IP_ADDR,
				port: Number(import.meta.env.VITE_PORT),
			},
			(err: any) => {
				// Listen handler doesn't need to do much except report errors!
				if (err) {
					app.log.error("THIS IS ERROR!!!!!!" + err);
				}
			}
		);
	} catch (err) {
		// This will catch any errors that further bubble up from listen(), should be unnecessary
		app.log.error(err);
	}
}
