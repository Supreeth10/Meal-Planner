import { FastifyInstance, FastifyReply } from "fastify";
import { createUser, createRecipeAndIngredients, createMealPlan } from "../HelperFunctions";
import { ShoppingList } from "../db/models/shopping_list";

/**
 * This module exports an async function that sets up POST routes for the Fastify application.
 * @module PostRoutes
 * @param {FastifyInstance} app - The Fastify server instance.
 */
export default async function postRoutes(app: FastifyInstance) {

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
				const result = await createRecipeAndIngredients(app, recipeName, dietType, cuisine, description, ingredients);
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
					reply.status(400).send(errMsg);
				} else {
					const result = await createMealPlan(app, userId, mealType, dayOfWeek, recipeId);
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
					let res = await shoppingList.save();
					reply.send(res);
				}
			}
		}
	});
}