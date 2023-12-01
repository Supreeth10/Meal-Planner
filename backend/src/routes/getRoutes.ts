import { handleNotFoundResponse, getRecipes, getMealPlan } from '../HelperFunctions';
import { FastifyInstance } from "fastify";

/**
 * This module exports an async function that sets up GET routes for the Fastify application.
 * @module GetRoutes
 * @param {FastifyInstance} app - The Fastify server instance. 
 */
export default async function getRoutes(app: FastifyInstance) {
	/**
	 * GET all users
	 * @route GET /users
	 * @param {Request} req - The request object.
	 * @param {Reply} reply - The reply object.
	 */
	app.get("/users", async (req: any, reply: any) => {
		let users = await app.db.user.find();
		reply.send(users);
	});

	/**
	 * GET user by id
	 * @route GET /users/{id}
	 * @param {Request} req - The request object.
	 * @param {Reply} reply - The reply object.
	 */
	app.get("/users/:id", async (req: any, reply: any) => {
		const id = req.params.id;
		let user = await app.db.user.find({
			where: {
				id: id,
			},
		});
		if (user.length == 0) {
			handleNotFoundResponse(reply, [{ name: 'user id', value: req.params.id }]);
		} else {
			reply.send(user);
		}
	});

	/**
	 * GET all recipes
	 * @route GET /recipes
	 * @param {Request} req - The request object.
	 * @param {Reply} reply - The reply object.
	 */
	app.get("/recipes", async (req: any, reply: any) => {
		let recipe = await app.db.rp.find();
		reply.send(recipe);
	});

	/**
	 * GET all recipes for a particular cuisine
	 * @route GET /recipes/cuisine/{cuisine}
	 * @param {Request} req - The request object.
	 * @param {Reply} reply - The reply object.
	 */
	app.get("/recipes/cuisine/:cuisine", async (req: any, reply: any) => {
		await getRecipes(app, reply, [
			{ name: 'cuisine', value: req.params.cuisine }
		]);
	});

	/**
	 * GET all recipes for a particular dietType
	 * @route GET /recipes/dietType/{dietType}
	 * @param {Request} req - The request object.
	 * @param {Reply} reply - The reply object.
	 */
	app.get("/recipes/dietType/:dietType", async (req: any, reply: any) => {
		await getRecipes(app, reply, [
			{ name: 'dietType', value: req.params.dietType }
		]);
	});

	/**
	 * GET all recipes for a particular cuisine and dietType
	 * @route GET /recipes/{cuisine}/{dietType}
	 * @param {Request} req - The request object.
	 * @param {Reply} reply - The reply object.
	 */
	app.get("/recipes/:cuisine/:dietType", async (req: any, reply: any) => {
		await getRecipes(app, reply, [
			{ name: 'cuisine', value: req.params.cuisine },
			{ name: 'dietType', value: req.params.dietType },
		]);
	});

	/**
	 * Get all mealplans for a user
	 * @route GET /mealplan/{userid}
	 * @param {Request} req - The request object.
	 * @param {Reply} reply - The reply object.
	 */
	app.get("/mealplan/:userid", async (req: any, reply: any) => {
		const userid = req.params.userid;
		await getMealPlan(app, reply, userid);
	});

	/**
	 * Get all mealplans for a user based on dayOfWeek
	 * @route GET /mealplan/{userid}/{dayOfWeek}
	 * @param {Request} req - The request object.
	 * @param {Reply} reply - The reply object.
	 */
	app.get("/mealplan/:userid/:dayOfWeek", async (req: any, reply: any) => {
		const userid = req.params.userid;
		const dayOfWeek = req.params.dayOfWeek;
		await getMealPlan(app, reply, userid, dayOfWeek);
	});

	/**
	 * Get shopping list for a user
	 * @route GET /shoppingList/{userid}
	 * @param {Request} req - The request object.
	 * @param {Reply} reply - The reply object.
	 */
	app.get("/shoppingList/:userid", async (req: any, reply: any) => {
		const userid = req.params.userid;
		let shoppingList = await app.db.sl.find({
			relations: {
				user: true,
				ing: true,
			},
			where: {
				user: {
					id: userid,
				},
				check: false,
			},
		});
		if (shoppingList.length == 0) {
			handleNotFoundResponse(reply, [
				{ name: 'user id', value: userid }
			]);
		} else {
			reply.send(shoppingList);
		}
	});
}