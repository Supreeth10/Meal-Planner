import { handleNotFoundResponse, getRecipes, getMealPlan } from '../HelperFunctions';
import { FastifyInstance } from "fastify";

/**
 * This module exports an async function that sets up GET routes for the Fastify application.
 * @module GetRoutes
 * @param {FastifyInstance} app - The Fastify server instance. 
 */
export class GetRoutes {
	private app: FastifyInstance;
	constructor(app: FastifyInstance) {
		this.app = app;
	}
	async registerRoutes() {
		this.app.get("/users", this.getUsers.bind(this));
		this.app.get("/users/:id", this.getUserById.bind(this));
		this.app.get("/recipes", this.getRecipes.bind(this));
		this.app.get("/recipes/cuisine/:cuisine", this.getRecipesByCuisine.bind(this));
		this.app.get("/recipes/dietType/:dietType", this.getRecipesByDietType.bind(this));
		this.app.get("/recipes/:cuisine/:dietType", this.getRecipesByCuisineAndDietType.bind(this));
		this.app.get("/mealplan/:userid", this.getMealPlan.bind(this));
		this.app.get("/mealplan/:userid/:dayOfWeek", this.getMealPlanByDayOfWeek.bind(this));
		this.app.get("/shoppingList/:userid", this.getShoppingList.bind(this));
	}

	async getUsers(req: any, reply: any) {
		let users = await this.app.db.user.find();
		reply.send(users);
	}

	async getUserById(req: any, reply: any) {
		const id = req.params.id;
		let user = await this.app.db.user.find({
			where: {
				id: id,
			},
		});
		if (user.length == 0) {
			handleNotFoundResponse(reply, [{ name: 'user id', value: req.params.id }]);
		} else {
			reply.send(user);
		}
	}

	async getRecipes(req: any, reply: any) {
		let recipe = await this.app.db.rp.find();
		reply.send(recipe);
	}

	async getRecipesByCuisine(req: any, reply: any) {
		await getRecipes(this.app, reply, [
			{ name: 'cuisine', value: req.params.cuisine }
		]);
	}

	async getRecipesByDietType(req: any, reply: any) {
		await getRecipes(this.app, reply, [
			{ name: 'dietType', value: req.params.dietType }
		]);
	}

	async getRecipesByCuisineAndDietType(req: any, reply: any) {
		await getRecipes(this.app, reply, [
			{ name: 'cuisine', value: req.params.cuisine },
			{ name: 'dietType', value: req.params.dietType },
		]);
	}

	async getMealPlan(req: any, reply: any) {
		const userid = req.params.userid;
		await getMealPlan(this.app, reply, userid);
	}

	async getMealPlanByDayOfWeek(req: any, reply: any) {
		const userid = req.params.userid;
		const dayOfWeek = req.params.dayOfWeek;
		await getMealPlan(this.app, reply, userid, dayOfWeek);
	}

	async getShoppingList(req: any, reply: any) {
		const userid = req.params.userid;
		let shoppingList = await this.app.db.sl.find({
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
	}
}