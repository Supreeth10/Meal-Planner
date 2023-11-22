// /** @module Routes */
import cors from "cors";
import {
	FastifyInstance,
	FastifyReply
} from "fastify";
import { User } from "./db/models/user";
import { Recipes } from "./db/models/recipes";
import { Ingredients } from "./db/models/ingredients";
import { RecipeIngredientRel } from "./db/models/recipe_ingredient_rel";
import { MealPlans } from "./db/models/meal_plans";
import { ShoppingList } from "./db/models/shopping_list";
import crypto from 'crypto';
import getRoutes from "./routes/getRoutes";
import delRoutes from "./routes/DeleteRoutes";


/**
 * App plugin where we construct our routes
 * @param {FastifyInstance} app our main Fastify app instance
 */
export async function planner_routes(app: FastifyInstance): Promise<void> {
	// Middleware
	// TODO: Refactor this in favor of fastify-cors
	app.use(cors());

	/*Helper functions*/
	function generateUserId() {
		return crypto.randomBytes(16).toString('hex');
	}

	async function validateUserAndItemExistence(
		app: any,
		userId: number,
		itemId: number,
		itemEntity: any
	): Promise<{ user: any; item: any }> {
		const user = await app.db.user.findOne({
			where: { id: userId },
		});

		const item = await app.db[itemEntity].findOne({
			where: { id: itemId },
		});

		if (!user || !item) {
			throw new Error(`User or ${itemEntity} does not exist`);
		}

		return { user, item };
	}

	async function validateShoppingListItemExistence(
		app: any,
		userId: number,
		ingredientId: number
	): Promise<ShoppingList> {
		const { user, item: ingredient } = await validateUserAndItemExistence(
			app,
			userId,
			ingredientId,
			'ig'
		);

		const shopListItem = await app.db.sl.findOne({
			where: {
				check: false,
				user: { id: userId },
				ing: { id: ingredientId },
			},
		});

		if (!shopListItem) {
			throw new Error(`User doesn't have this ingredient in their shopping list`);
		}

		return shopListItem;
	}

	async function updateShoppingListStatus(app: any, userId: number, ingredientId: number, reply: any) {
		try {
			const shopListItem = await validateShoppingListItemExistence(app, userId, ingredientId);
			shopListItem.check = true;
			const result = await shopListItem.save();
			reply.send(result);
		} catch (error) {
			reply.status(404).send({ error: "Error occured" });
		}
	}

	async function updateMealPlan(app: any, userId: number, mealType: string, dayOfWeek: string, recipeId: number, reply: any) {
		try {
			const { user, item: recipe } = await validateUserAndItemExistence(app, userId, recipeId, 'rp');

			const existingMealPlan = await app.db.mp.findOne({
				where: {
					user: { id: userId },
					dayOfWeek,
					mealType,
				},
			});

			if (existingMealPlan) {
				existingMealPlan.recipe = recipe;
				const result = await existingMealPlan.save();
				reply.send(result);
			} else {
				const errMsg = {
					error: `There doesn't exist a recipe for ${dayOfWeek} ${mealType} in this user's meal plan. Please add this meal plan first.`,
				};
				reply.status(400).send(errMsg);

				const ingredients = await app.db.rpIngRel.find({
					relations: { ingredient: true },
					where: { recipe: { id: recipeId } },
				});

				const mealPlan = new MealPlans();
				mealPlan.user = user;
				mealPlan.mealType = mealType;
				mealPlan.dayOfWeek = dayOfWeek;
				mealPlan.recipe = recipe;

				const result = await mealPlan.save();

				for (const ing of ingredients) {
					const shoppingList = new ShoppingList();
					shoppingList.user = user;
					shoppingList.ing = ing.ingredient;
					await shoppingList.save();
				}

				reply.send(result);
			}
		} catch (error) {
			reply.status(400).send({ error: "Error occured" });
		}
	}
	async function createRecipeAndIngredients(
		recipeName: string,
		dietType: string,
		cuisine: string,
		description: string,
		ingredients: { ingName: string }[]
	): Promise<Recipes> {
		const recipe = new Recipes();
		recipe.recipeName = recipeName;
		recipe.dietType = dietType;
		recipe.cuisine = cuisine;
		recipe.description = description;
		const res = await recipe.save();

		const promises = ingredients.map(async (ingredientData) => {
			let ing = await app.db.ig.findOne({
				where: {
					ingName: ingredientData.ingName,
				},
			});

			if (!ing) {
				ing = new Ingredients();
				ing.ingName = ingredientData.ingName;
				await ing.save();
			}

			const recipeIngredient = new RecipeIngredientRel();
			recipeIngredient.recipe = recipe;
			recipeIngredient.ingredient = ing;
			return recipeIngredient.save();
		});

		await Promise.all(promises);

		return res;
	}
	async function createUser(name: string, email: string): Promise<User> {
		const user = new User();
		user.id = generateUserId();
		user.name = name;
		user.email = email;
		return user.save();
	}

	async function createMealPlan(userId: number, mealType: string, dayOfWeek: string, recipeId: number) {
		const ings = await app.db.rpIngRel.find({
			relations: { ingredient: true },
			where: { recipe: { id: recipeId } },
		});

		const user = await app.db.user.findOne({ where: { id: userId } });
		const recipe = await app.db.rp.findOne({ where: { id: recipeId } });

		if (user && recipe) {
			const mealPlan = new MealPlans();
			mealPlan.user = user;
			mealPlan.mealType = mealType;
			mealPlan.dayOfWeek = dayOfWeek;
			mealPlan.recipe = recipe;

			const res = await mealPlan.save();

			for (let i = 0; i < ings.length; i++) {
				const shoppingList = new ShoppingList();
				shoppingList.user = user;
				shoppingList.ing = ings[i].ingredient;
				await shoppingList.save();
			}
			return res;
		}
	}

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
	/*----------------------------------- START of PUT ROUTES----------------------------------- */
	// PUT ingredient's checked status to true for a user's shopping list
	app.put<{
		Body: {
			userId: number;
			ingredientId: number;
		};
		Reply: any;
	}>("/shoppinglist", async (req: any, reply: FastifyReply) => {
		const { userId, ingredientId } = req.body;
		if (!userId || !ingredientId) {
			reply.status(400).send({ error: "userId and ingredientId are required" });
		} else {
			await updateShoppingListStatus(app, userId, ingredientId, reply);
		}
	});

	// PUT existing mealplan for a user to update the recipe
	app.put<{
		Body: {
			userId: number;
			mealType: string;
			dayOfWeek: string;
			recipeId: number;
		};
		Reply: any;
	}>("/mealplan", async (req: any, reply: FastifyReply) => {
		const { userId, mealType, dayOfWeek, recipeId } = req.body;
		if (!userId || !mealType || !dayOfWeek || !recipeId) {
			reply.status(400).send({ error: "userId, mealType, dayOfWeek, and recipeId are required" });
		} else {
			await updateMealPlan(app, userId, mealType, dayOfWeek, recipeId, reply);
		}
	});


	/*----------------------------------- END of PUT ROUTES----------------------------------- */

	/*----------------------------------- START of POST ROUTES----------------------------------- */

	//POST new user
	app.post<{
		Body: {
			name: string;
			email: string;
		};
		Reply:
		| {
			id?: string;
			name?: string;
			email?: string;
			created_at?: string;
			updated_at?: string;
			error?: string;
		}
		| string;
	}>("/users", async (req: any, reply: any) => {
		const { name, email } = req.body;

		if (!name || !email) {
			reply.status(400).send({ error: "Name and email are required" });
		} else {
			const existingUser = await app.db.user.findOne({
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
	});

	//POST new recipe and post related relation in ingredients recipe relation table
	app.post<{
		Body: {
			recipeName: string;
			dietType: string;
			cuisine: string;
			description: string;
			ingredients: [{ ingName: string }];
		};
		Reply: any;
	}>("/recipe", async (req: any, reply: FastifyReply) => {
		const { recipeName, dietType, cuisine, description, ingredients } = req.body;
		if (!recipeName || !dietType || !cuisine || !description || !ingredients) {
			reply.status(400).send({ error: "recipeName, description, cuisine, dietType, and ingredients are required" });
		} else if (ingredients.length === 0) {
			reply.status(400).send({ error: "A recipe must have atleast one ingredient" });
		}
		else {
			try {
				const result = await createRecipeAndIngredients(recipeName, dietType, cuisine, description, ingredients);
				reply.send(result);
			} catch (error) {
				reply.status(500).send({ error: "Error occured" });
			}
		}
	});

	// POST new mealplan for a user
	app.post<{
		Body: {
			userId: number;
			mealType: string;
			dayOfWeek: string;
			recipeId: number;
		};
		Reply: any;
	}>("/mealplan", async (req: any, reply: FastifyReply) => {
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
			// there has to be a better check to see if mealType and dayOfWeek are valid
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
			let user = await app.db.user.findOne({
				where: {
					id: userId,
				},
			});
			let recipe = await app.db.rp.findOne({
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
				let existingMealPlan = await app.db.mp.findOne({
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
					reply.status(400).send(errMsg); //is this the right status code?
				} else {
					const result = await createMealPlan(userId, mealType, dayOfWeek, recipeId);
					reply.send(result);
				}
			}
		}
	});

	//POST ingredient to a users shopping list
	app.post<{
		Body: {
			userId: number;
			ingredientId: number;
		};
		Reply: any;
	}>("/shoppinglist", async (req: any, reply: FastifyReply) => {
		const { userId, ingredientId } = req.body;
		if (!userId || !ingredientId) {
			let errMsg = {
				error: "userId and ingredientId are required",
			};
			reply.status(400).send(errMsg);
		} else {
			let user = await app.db.user.findOne({
				where: {
					id: userId,
				},
			});
			let ingredient = await app.db.ig.findOne({
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
				let ShopListItem = await app.db.sl.find({
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
					//not setting checked cause it is false by default
					let res = await shoppingList.save();
					reply.send(res);
				}
			}
		}
	});


	/*----------------------------------- END of POST ROUTES----------------------------------- */
}
