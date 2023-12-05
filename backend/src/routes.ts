// /** @module Routes */
import cors from "cors";
import { FastifyInstance } from "fastify";
import { GetRoutes } from "./routes/getRoutes";
import { DeleteRoutes } from "./routes/deleteRoutes";
import { PutRoutes } from "./routes/putRoutes";
import { PostRoutes } from "./routes/postRoutes";


/**
 * App plugin where we construct our routes
 * @param {FastifyInstance} app our main Fastify app instance
 */
export async function planner_routes(app: FastifyInstance): Promise<void> {
	// Middleware
	app.use(cors());
	const getRoutes = new GetRoutes(app);
	const postRoutes = new PostRoutes(app);
	const deleteRoutes = new DeleteRoutes(app);
	const putRoutes = new PutRoutes(app);

	getRoutes.registerRoutes();
	putRoutes.registerRoutes();
	postRoutes.registerRoutes();
	deleteRoutes.registerRoutes();
}
