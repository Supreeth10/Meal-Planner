// /** @module Routes */
import cors from "cors";
import {
	FastifyInstance,
	FastifyReply,
	FastifyRequest,
	RouteShorthandOptions,
} from "fastify";
import { User } from "./db/models/user";
//import { ILike, LessThan, Not } from "typeorm";
import { Recipes } from "./db/models/recipes";
import { Ingredients } from "./db/models/ingredients";
import { RecipeIngredientRel } from "./db/models/recipe_ingredient_rel";
import { MealPlans } from "./db/models/meal_plans";
import { ShoppingList } from "./db/models/shopping_list";
import { Brackets } from "typeorm";
import crypto from 'crypto';



/**
 * App plugin where we construct our routes
 * @param {FastifyInstance} app our main Fastify app instance
 */
export async function planner_routes(app: FastifyInstance): Promise<void> {
	// Middleware
	// TODO: Refactor this in favor of fastify-cors
	app.use(cors());


	/*Helper functions*/
	type param = {
		name: string;
		value: string;
	};
	function generateUserId() {
		return crypto.randomBytes(16).toString('hex');
	}
	async function handleNotFoundResponse(reply: any, params: param[]) { //unsure of type for reply
		let errMsg = {
			error: `No record found for ${params.map(param => `${param.name}: ${param.value}`).join(', ')}`,
		};
		reply.status(404).send(errMsg);
	}


	async function getRecipes(reply: any, params: { name: string; value: any }[]) {
		const whereClause: { [key: string]: any } = {};

		for (const param of params) {
			whereClause[param.name] = param.value;
		}

		let recipes = await app.db.rp.find({
			where: whereClause,
		});

		if (recipes.length === 0) {
			handleNotFoundResponse(reply, params);
		} else {
			reply.send(recipes);
		}
	}

	async function getMealPlan(reply: any, userid: string, dayOfWeek?: string) {
		let whereClause: any = {
			user: {
				id: userid,
			},
		};

		if (dayOfWeek) {
			whereClause.dayOfWeek = dayOfWeek;
		}

		let mealPlan = await app.db.mp.find({
			relations: {
				recipe: true,
			},
			where: whereClause,
		});

		if (mealPlan.length === 0) {
			const params = [
				{ name: 'user id', value: userid },
				...(dayOfWeek ? [{ name: 'day Of Week', value: dayOfWeek }] : []),
			];
			handleNotFoundResponse(reply, params);
		} else {
			reply.send(mealPlan);
		}
	}

	async function deleteMealPlan(app: any, userId: string, conditions: Record<string, string>, reply: any) {
		const query = app.db.mp
			.createQueryBuilder("mp")
			.where("userId = :id", { id: userId })
			.andWhere(new Brackets(qb => {
				for (const key in conditions) {
					qb.andWhere(`${key} = :${key}`, { [key]: conditions[key] });
				}
			}))
			.delete()
			.execute();

		const result: any = await query;
		reply.send(result);
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
			reply.status(404).send({ error: error.message });
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
			reply.status(400).send({ error: error.message });
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

	/*----------------------------------- START of GET ROUTES----------------------------------- */

	//GET all users
	app.get("/users", async (req: any, reply: any) => {
		let users = await app.db.user.find();
		reply.send(users);
	});

	//GET user by id
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

	//GET all recipe
	app.get("/recipes", async (req: any, reply: any) => {
		let recipe = await app.db.rp.find();
		reply.send(recipe);
	});

	//GET all recipe for a particular Cuisine
	//TO might have to change enums for cusineType in recipe to all lowercase. Or else if user enters cajun instead of Cajun, nothing will be returned
	app.get("/recipes/cuisine/:cuisine", async (req: any, reply: any) => {
		await getRecipes(reply, [
			{ name: 'cuisine', value: req.params.cuisine }
		]);
	});

	//GET all recipe for a particular dietType
	app.get("/recipes/dietType/:dietType", async (req: any, reply: any) => {
		await getRecipes(reply, [
			{ name: 'dietType', value: req.params.dietType }
		]);
	});

	//GET all recipe for a particular dietType and cuisine
	app.get("/recipes/:cuisine/:dietType", async (req: any, reply: any) => {
		await getRecipes(reply, [
			{ name: 'cuisine', value: req.params.cuisine },
			{ name: 'dietType', value: req.params.dietType },
		]);
	});

	//TODO: check if any needs to be removed
	//GET mealplans for a particular user
	app.get("/mealplan/:userid", async (req: any, reply: any) => {
		const userid = req.params.userid;
		await getMealPlan(reply, userid);
	});

	//convert dayOfWeek in the query param to lower case and then get mealplan for a user based on dayOfWeek
	//get mealplan for a user based on dayOfWeek
	app.get("/mealplan/:userid/:dayOfWeek", async (req: any, reply: any) => {
		const userid = req.params.userid;
		const dayOfWeek = req.params.dayOfWeek;
		await getMealPlan(reply, userid, dayOfWeek);
	});

	//GET shoppingList for a user
	// need to return ing name too - done
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

	/*----------------------------------- END of GET ROUTES----------------------------------- */

	/*----------------------------------- START of DELETE ROUTES----------------------------------- */
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

	/*----------------------------------- END of DELETE ROUTES----------------------------------- */

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


	/*----------------------------------- START of PUT ROUTES----------------------------------- */

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
					reply.status(500).send({ error: error.message });
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
				reply.status(500).send({ error: error.message });
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
