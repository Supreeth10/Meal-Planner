import { deleteMealPlan } from '../HelperFunctions';
import { FastifyInstance } from "fastify";

/**
 * This module exports an async function that sets up DELETE routes for the Fastify application.
 * @module DeleteRoutes
 * @param {FastifyInstance} app - The Fastify server instance.
 */
export default async function delRoutes(app: FastifyInstance) {
	/**
     * DELETE user by id
     * @route DELETE /users/{id}
     * @param {Request} req - The request object.
     * @param {Reply} reply - The reply object.
     */
	app.delete("/users/:id", async (req: any, reply: any) => {
		const id = req.params.id;
		let user = await app.db.user.findOneByOrFail({
			id: id,
		});
		let res = await user.remove();
		reply.send(user);
	});

	/**
	 * DELETE mealplan for a user
	 * @route DELETE /mealplan/{userid}
	 * @param {Request} req - The request object.
	 * @param {Reply} reply - The reply object.
	 */
	app.delete("/mealplan/:userid", async (req: any, reply: any) => {
		const userId = req.params.userid;
		await deleteMealPlan(app, userId, {}, reply);
	});

	/**
	 * DELETE mealplan for a user based on dayOfWeek and mealType
	 * @route DELETE /mealplan/{userid}/{dayOfWeek}/{mealType}
	 * @param {Request} req - The request object.
	 * @param {Reply} reply - The reply object.
	 */
	app.delete(
		"/mealplan/:userid/:dayOfWeek/:mealType",
		async (req: any, reply: any) => {
			const { userid, dayOfWeek, mealType } = req.params;
			await deleteMealPlan(app, userid, { dayOfWeek, mealType }, reply);
		}
	);

	/**
	 * DELETE mealplan for a user based on dayOfWeek
	 * @route DELETE /mealplan/{userid}/{dayOfWeek}
	 * @param {Request} req - The request object.
	 * @param {Reply} reply - The reply object.
	 */
	app.delete("/mealplan/:userid/:dayOfWeek", async (req: any, reply: any) => {
		const { userid, dayOfWeek } = req.params;
		await deleteMealPlan(app, userid, { dayOfWeek }, reply);
	});

}