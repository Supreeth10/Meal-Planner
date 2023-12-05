import { deleteMealPlan } from '../HelperFunctions';
import { FastifyInstance } from "fastify";

/**
 * Represents a class that handles delete routes for the application.
 */
export class DeleteRoutes {
	private app: FastifyInstance;
	/**
	 * Creates an instance of DeleteRoutes.
	 * @param {FastifyInstance} app - The Fastify instance.
	 */
	constructor(app: FastifyInstance) {
		this.app = app;
	}

	/**
	 * Register delete routes for the application.
	 */
	async registerRoutes() {
		this.app.delete("/users/:id", this.deleteUserById.bind(this));
		this.app.delete("/mealplan/:userid", this.deleteMealPlanRoute.bind(this));
		this.app.delete("/mealplan/:userid/:dayOfWeek/:mealType", this.deleteMealPlanByDayOfWeekAndMealType.bind(this));
		this.app.delete("/mealplan/:userid/:dayOfWeek", this.deleteMealPlanByDayOfWeek.bind(this));
	}

	/**
	 * DELETE user by id
	 * @route DELETE /users/{id}
	 * @param {Request} req - The request object.
	 * @param {Reply} reply - The reply object.
	 */
	async deleteUserById(req: any, reply: any) {
		const id = req.params.id;
		let user = await this.app.db.user.findOneByOrFail({
			id: id,
		});
		let res = await user.remove();
		reply.send(user);
	}

	/**
	 * DELETE mealplan for a user
	 * @route DELETE /mealplan/{userid}
	 * @param {Request} req - The request object.
	 * @param {Reply} reply - The reply object.
	 */
	async deleteMealPlanRoute(req: any, reply: any) {
		const userId = req.params.userid;
		await deleteMealPlan(this.app, userId, {}, reply);
	}

	/**
	 * DELETE mealplan for a user based on dayOfWeek and mealType
	 * @route DELETE /mealplan/{userid}/{dayOfWeek}/{mealType}
	 * @param {Request} req - The request object.
	 * @param {Reply} reply - The reply object.
	 */
	async deleteMealPlanByDayOfWeekAndMealType(req: any, reply: any) {
		const { userid, dayOfWeek, mealType } = req.params;
		await deleteMealPlan(this.app, userid, { dayOfWeek, mealType }, reply);
	}

	/**
	 * DELETE mealplan for a user based on dayOfWeek
	 * @route DELETE /mealplan/{userid}/{dayOfWeek}
	 * @param {Request} req - The request object.
	 * @param {Reply} reply - The reply object.
	 */
	async deleteMealPlanByDayOfWeek(req: any, reply: any) {
		const { userid, dayOfWeek } = req.params;
		await deleteMealPlan(this.app, userid, { dayOfWeek }, reply);
	}
}