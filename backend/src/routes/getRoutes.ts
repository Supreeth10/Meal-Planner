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

	/**
	 * Register get routes for the application.
	 */
	async registerRoutes() {
		this.app.get("/users", this.getUsersRoute.bind(this));
		this.app.get("/users/:id", this.getUserById.bind(this));
		this.app.get("/recipes", this.getRecipesRoute.bind(this));
		this.app.get("/recipes/cuisine/:cuisine", this.getRecipesByCuisine.bind(this));
		this.app.get("/recipes/dietType/:dietType", this.getRecipesByDietType.bind(this));
		this.app.get("/recipes/:cuisine/:dietType", this.getRecipesByCuisineAndDietType.bind(this));
		this.app.get("/mealplan/:userid", this.getMealPlanRoute.bind(this));
		this.app.get("/mealplan/:userid/:dayOfWeek", this.getMealPlanByDayOfWeek.bind(this));
		this.app.get("/shoppingList/:userid", this.getShoppingListRoute.bind(this));
	}

	/**
	 * GET all users
	 * @route GET /users
	 * @param {Request} req - The request object.
	 * @param {Reply} reply - The reply object.
	 */
	async getUsersRoute(req: any, reply: any) {
		let users = await this.app.db.user.find();
		reply.send(users);
	}

	/**
	 * GET user by id
	 * @route GET /users/{id}
	 * @param {Request} req - The request object.
	 * @param {Reply} reply - The reply object.
	 */
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

	/**
	 * GET all recipes
	 * @route GET /recipes
	 * @param {Request} req - The request object.
	 * @param {Reply} reply - The reply object.
	 */
	async getRecipesRoute(req: any, reply: any) {
		let recipe = await this.app.db.rp.find();
		reply.send(recipe);
	}

	/**
	 * GET recipes by cuisine
	 * @route GET /recipes/cuisine/{cuisine}
	 * @param {Request} req - The request object.
	 * @param {Reply} reply - The reply object.
	 */
	async getRecipesByCuisine(req: any, reply: any) {
		await getRecipes(this.app, reply, [
			{ name: 'cuisine', value: req.params.cuisine }
		]);
	}

	/**
	 * GET recipes by dietType
	 * @route GET /recipes/dietType/{dietType}
	 * @param {Request} req - The request object.
	 * @param {Reply} reply - The reply object.
	 */
	async getRecipesByDietType(req: any, reply: any) {
		await getRecipes(this.app, reply, [
			{ name: 'dietType', value: req.params.dietType }
		]);
	}

	/**
	 * GET recipes by cuisine and dietType
	 * @route GET /recipes/{cuisine}/{dietType}
	 * @param {Request} req - The request object.
	 * @param {Reply} reply - The reply object.
	 */
	async getRecipesByCuisineAndDietType(req: any, reply: any) {
		await getRecipes(this.app, reply, [
			{ name: 'cuisine', value: req.params.cuisine },
			{ name: 'dietType', value: req.params.dietType },
		]);
	}

	/**
	 * GET mealplan for a user
	 * @route GET /mealplan/{userid}
	 * @param {Request} req - The request object.
	 * @param {Reply} reply - The reply object.
	 */
	async getMealPlanRoute(req: any, reply: any) {
		const userid = req.params.userid;
		await getMealPlan(this.app, reply, userid);
	}

	/**
	 * GET mealplan for a user based on dayOfWeek
	 * @route GET /mealplan/{userid}/{dayOfWeek}
	 * @param {Request} req - The request object.
	 * @param {Reply} reply - The reply object.
	 */
	async getMealPlanByDayOfWeek(req: any, reply: any) {
		const userid = req.params.userid;
		const dayOfWeek = req.params.dayOfWeek;
		await getMealPlan(this.app, reply, userid, dayOfWeek);
	}

	/**
	 * GET shopping list for a user
	 * @route GET /shoppingList/{userid}
	 * @param {Request} req - The request object.
	 * @param {Reply} reply - The reply object.
	 */
	async getShoppingListRoute(req: any, reply: any) {
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