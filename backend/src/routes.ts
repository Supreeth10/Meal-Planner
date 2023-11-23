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

	async function validateUser(userId: any, reply: any) {
		const user = await app.db.user.findOne({
			where: { id: userId },
		});

		if (!user) {
			const errMsg = { error: "User does not exist" };
			reply.status(404).send(errMsg);
			return false;
		}

		return true;
	}
	/*----------------------------------- START of ROUTES----------------------------------- */
	getRoutes(app);
	delRoutes(app);
	putRoutes(app);
	postRoutes(app);

	/*----------------------------------- END of ROUTES----------------------------------- */
}
