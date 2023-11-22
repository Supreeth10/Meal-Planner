import { deleteMealPlan } from '../HelperFunctions';
import { FastifyInstance } from "fastify";

export default async function delRoutes(app: FastifyInstance) {
	//DELETE user by id
	app.delete("/users/:id", async (req: any, reply: any) => {
		const id = req.params.id;
		let user = await app.db.user.findOneByOrFail({
			id: id,
		});
		let res = await user.remove();
		reply.send(user);
	});
	//DELETE all mealplans for a particular user
	app.delete("/mealplan/:userid", async (req: any, reply: any) => {
		const userId = req.params.userid;
		await deleteMealPlan(app, userId, {}, reply);
	});

	//DELETE a mealplans for a particular user based on dayOfWeek and mealType
	app.delete(
		"/mealplan/:userid/:dayOfWeek/:mealType",
		async (req: any, reply: any) => {
			const { userid, dayOfWeek, mealType } = req.params;
			await deleteMealPlan(app, userid, { dayOfWeek, mealType }, reply);
		}
	);

	//DELETE mealplan for a user based on dayOfWeek
	app.delete("/mealplan/:userid/:dayOfWeek", async (req: any, reply: any) => {
		const { userid, dayOfWeek } = req.params;
		await deleteMealPlan(app, userid, { dayOfWeek }, reply);
	});

}