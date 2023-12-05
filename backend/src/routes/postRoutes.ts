import { FastifyInstance } from "fastify";
import { createUser, createRecipeAndIngredients, createMealPlan } from "../HelperFunctions";
import { ShoppingList } from "../db/models/shopping_list";

/**
 * Represents a class that handles Post routes for the application.
 */
export class PostRoutes {
	private app: FastifyInstance;
	constructor(app: FastifyInstance) {
		this.app = app;
	}

	/**
	 * Register post routes for the application.
	 */
	async registerRoutes() {
		this.app.post("/users", this.postUserRoute.bind(this));
		this.app.post("/recipe", this.postRecipeRoute.bind(this));
		this.app.post("/mealplan", this.postMPRoute.bind(this));
		this.app.post("/shoppinglist", this.postShoppingListRoute.bind(this));
	}

	/**
	 * POST a new user
	 * @route POST /users
	 * @param {Request} req - The request object.
	 * @param {Reply} reply - The reply object.
	 */
	async postUserRoute(req: any, reply: any) {
		const { name, email } = req.body;

		if (!name || !email) {
			reply.status(400).send({ error: "Name and email are required" });
		} else {
			const existingUser = await this.app.db.user.findOne({
				where: {
					email: email,
				},
			});

			if (existingUser) {
				const errMsg = {
					error: `This user already exists`,
				};
				reply.status(400).send(errMsg);
			}
			else {
				try {
					const user = await createUser(name, email);
					reply.send(user);
				} catch (error) {
					reply.status(500).send({ error: "Error occured" });
				}
			}
		}
	}

	/**
	 * POST a new recipe
	 * @route POST /recipe
	 * @param {Request} req - The request object.
	 * @param {Reply} reply - The reply object.
	 */
	async postRecipeRoute(req: any, reply: any) {
		const { recipeName, dietType, cuisine, description, ingredients } = req.body;
		if (!recipeName || !dietType || !cuisine || !description || !ingredients) {
			reply.status(400).send({ error: "recipeName, description, cuisine, dietType, and ingredients are required" });
		} else if (ingredients.length === 0) {
			reply.status(400).send({ error: "A recipe must have atleast one ingredient" });
		}
		else {
			try {
				const result = await createRecipeAndIngredients(this.app, recipeName, dietType, cuisine, description, ingredients);
				reply.send(result);
			} catch (error) {
				reply.status(500).send({ error: "Error occured" });
			}
		}
	}

	/**
	 * POST a new mealplan for a user
	 * @route POST /mealplan
	 * @param {Request} req - The request object.
	 * @param {Reply} reply - The reply object.
	 */
	async postMPRoute(req: any, reply: any) {
		let mealTypeOptions = ["breakfast", "lunch", "dinner", "snack"];
		let dayOfWeekOptions = [
			"monday",
			"tuesday",
			"wednesday",
			"thursday",
			"friday",
			"saturday",
			"sunday",
		];
		const { userId, mealType, dayOfWeek, recipeId } = req.body;
		if (!userId || !mealType || !dayOfWeek || !recipeId) {
			let errMsg = {
				error: "userId, mealType, dayOfWeek and recipeId are required",
			};
			reply.status(400).send(errMsg);
		} else if (
			!mealTypeOptions.includes(mealType) ||
			!dayOfWeekOptions.includes(dayOfWeek)
		) {
			let errMsg = {
				error: "mealType and dayOfWeek must be valid",
			};
			reply.status(400).send(errMsg);
		} else {
			let user = await this.app.db.user.findOne({
				where: {
					id: userId,
				},
			});
			let recipe = await this.app.db.rp.findOne({
				where: {
					id: recipeId,
				},
			});
			if (!user || !recipe) {
				let errMsg = {
					error: "User or Recipe does not exist",
				};
				reply.status(404).send(errMsg);
			} else {
				let existingMealPlan = await this.app.db.mp.findOne({
					where: {
						user: {
							id: userId,
						},
						dayOfWeek: dayOfWeek,
						mealType: mealType,
					},
				});

				if (existingMealPlan) {
					let errMsg = {
						error: `there already existing a recipe for ${dayOfWeek} ${mealType} in this users userID:${userId} meal plan. Please delete the existing meal plan first `,
					};
					reply.status(400).send(errMsg);
				} else {
					const result = await createMealPlan(this.app, userId, mealType, dayOfWeek, recipeId);
					reply.send(result);
				}
			}
		}
	}

	/**
	 * POST a new ingredient to a user's shopping list
	 * @route POST /shoppinglist
	 * @param {Request} req - The request object.
	 * @param {Reply} reply - The reply object.
	 */
	async postShoppingListRoute(req: any, reply: any) {
		const { userId, ingredientId } = req.body;
		if (!userId || !ingredientId) {
			let errMsg = {
				error: "userId and ingredientId are required",
			};
			reply.status(400).send(errMsg);
		} else {
			let user = await this.app.db.user.findOne({
				where: {
					id: userId,
				},
			});
			let ingredient = await this.app.db.ig.findOne({
				where: {
					id: ingredientId,
				},
			});
			if (!user || !ingredient) {
				let errMsg = {
					error: "User or Ingredient does not exist",
				};
				reply.status(404).send(errMsg);
			} else {
				let ShopListItem = await this.app.db.sl.find({
					where: {
						check: false,
						user: {
							id: userId,
						},
						ing: {
							id: ingredientId,
						},
					},
				});
				if (ShopListItem !== null && ShopListItem.length > 0) {
					let errMsg = {
						error: `User already has this ingredient in their shopping list`,
					};
					reply.status(400).send(errMsg);
				} else {
					let shoppingList = new ShoppingList();
					shoppingList.user = user;
					shoppingList.ing = ingredient;
					let res = await shoppingList.save();
					reply.send(res);
				}
			}
		}
	}
}