// /** @module Routes */
import cors from "cors";
import { FastifyInstance } from "fastify";
import getRoutes from "./routes/getRoutes";
import delRoutes from "./routes/DeleteRoutes";
import putRoutes from "./routes/putRoutes";
import postRoutes from "./routes/postRoutes";


/**
 * App plugin where we construct our routes
 * @param {FastifyInstance} app our main Fastify app instance
 */
export async function planner_routes(app: FastifyInstance): Promise<void> {
	// Middleware
	// TODO: Refactor this in favor of fastify-cors
	app.use(cors());

	getRoutes(app);
	delRoutes(app);
	putRoutes(app);
	postRoutes(app);
}
