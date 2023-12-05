// /** @module Routes */
import cors from "cors";
import { FastifyInstance } from "fastify";
import { GetRoutes } from "./routes/getRoutes";
import { DeleteRoutes } from "./routes/deleteRoutes";
import putRoutes from "./routes/putRoutes";
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
	getRoutes.registerRoutes();
	putRoutes(app);
	postRoutes.registerRoutes();
	deleteRoutes.registerRoutes();
}
