import { MealPlans } from "./db/models/meal_plans";
import { ShoppingList } from "./db/models/shopping_list";
import { FastifyInstance } from "fastify";
import { Brackets } from "typeorm";
import { User } from "./db/models/user";
import crypto from 'crypto';
import { Recipes } from "./db/models/recipes";
import { Ingredients } from "./db/models/ingredients";
import { RecipeIngredientRel } from "./db/models/recipe_ingredient_rel";


type param = {
	name: string;
	value: string;
};
/**
 * Handles not found responses.
 * @param reply - The reply object from Fastify.
 * @param params - The parameters to include in the error message.
 */
export async function handleNotFoundResponse(reply: any, params: param[]) {
	let errMsg = {
		error: `No record found for ${params.map(param => `${param.name}: ${param.value}`).join(', ')}`,
	};
	reply.status(404).send(errMsg);
}
/**
 * Gets recipes based on provided parameters.
 * @param app - The Fastify instance.
 * @param reply - The reply object from Fastify.
 * @param params - The parameters to use for the query.
 */
export async function getRecipes(app: FastifyInstance, reply: any, params: { name: string; value: any }[]) {
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

/**
 * Retrieves the meal plan for a specific user and day of the week.
 * If `dayOfWeek` is not provided, retrieves the meal plan for all days of the week.
 * @param app - The Fastify instance.
 * @param reply - The reply object.
 * @param userid - The ID of the user.
 * @param dayOfWeek - Optional. The day of the week for which to retrieve the meal plan.
 * @returns A Promise that resolves to the meal plan.
 */
export async function getMealPlan(app: FastifyInstance, reply: any, userid: string, dayOfWeek?: string) {
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

/**
 * Deletes a meal plan based on the given conditions.
 * 
 * @param app - The application object.
 * @param userId - The ID of the user.
 * @param conditions - The conditions to filter the meal plan.
 * @param reply - The reply object to send the result.
 * @returns A promise that resolves with the result of the deletion.
 */
export async function deleteMealPlan(app: any, userId: string, conditions: Record<string, string>, reply: any) {
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



/**
 * Updates the status of a shopping list item.
 * 
 * @param app - The application object.
 * @param userId - The ID of the user.
 * @param ingredientId - The ID of the ingredient.
 * @param reply - The reply object.
 * @returns The updated shopping list item.
 */
export async function updateShoppingListStatus(app: any, userId: number, ingredientId: number, reply: any) {
	try {
		const { user, item: ingredient } = await validateUserAndItemExistence(
			app,
			userId,
			ingredientId,
			'ig'
		);
		console.log("Validated user and item:", user.id, ingredient.id);
		const shopListItem = await validateShoppingListItemExistence(app, user.id, ingredient.id);
		console.log("Validated shopping list item:", shopListItem);
		shopListItem.check = true;
		const result = await shopListItem.save();
		console.log("Updated shopping list item:", result);
		reply.send(result);
	} catch (error) {
		console.error('Error in updateShoppingListStatus:', error);
		throw new Error('Failed to update shopping list status');
	}
}

/**
 * Validates the existence of a shopping list item for a given user and ingredient.
 * 
 * @param app - The application object.
 * @param userId - The ID of the user.
 * @param ingredientId - The ID of the ingredient.
 * @returns A Promise that resolves to the validated shopping list item.
 * @throws An error if the user doesn't have the ingredient in their shopping list or if there is an error during validation.
 */
export async function validateShoppingListItemExistence(
	app: any,
	userId: number,
	ingredientId: number
): Promise<ShoppingList> {
	try {

		const shopListItem = await app.db.sl.findOne({
			where: {
				check: false,
				user: { id: userId },
				ing: { id: ingredientId },
			},
		});
		console.log("ID", shopListItem.id);
		if (!shopListItem) {
			throw new Error(`User doesn't have this ingredient in their shopping list`);
		}
		console.log("Validated shopping list item:", shopListItem);
		return shopListItem;
	}
	catch (error) {
		console.error('Error in validateShoppingListItemExistence:', error);
		throw new Error('Failed to validate shopping list item existence');
	}
}

/**
 * Validates the existence of a user and an item in the database.
 * @param app - The application object.
 * @param userId - The ID of the user.
 * @param itemId - The ID of the item.
 * @param itemEntity - The entity name of the item.
 * @returns A promise that resolves to an object containing the user and item if they exist.
 * @throws An error if the user or item does not exist.
 */
export async function validateUserAndItemExistence(
	app: any,
	userId: number,
	itemId: number,
	itemEntity: any
): Promise<{ user: any; item: any }> {
	try {
		const user = await app.db.user.findOne({
			where: { id: userId },
		});

		const item = await app.db[itemEntity].findOne({
			where: { id: itemId },
		});

		if (!user || !item) {
			throw new Error(`User or ${itemEntity} does not exist`);
		}
		console.log("Validated user and item", user, item);
		return { user, item };
	}
	catch (error) {
		console.error('Error in validateUserAndItemExistence:', error);
		throw new Error('Failed to validate user and item existence');
	}
}

/**
 * Updates the meal plan for a user by adding or updating a recipe for a specific meal type and day of the week.
 * If the meal plan already exists, the recipe will be updated. If not, a new meal plan will be created.
 * @param app - The application object.
 * @param userId - The ID of the user.
 * @param mealType - The type of the meal (e.g., breakfast, lunch, dinner).
 * @param dayOfWeek - The day of the week (e.g., Monday, Tuesday, Wednesday).
 * @param recipeId - The ID of the recipe.
 * @param reply - The reply object to send the response.
 * @returns The updated or newly created meal plan.
 * @throws If there is an error during the process.
 */
export async function updateMealPlan(app: any, userId: number, mealType: string, dayOfWeek: string, recipeId: number, reply: any) {
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

/**
 * Creates a new user with the given name and email.
 * @param name - The name of the user.
 * @param email - The email of the user.
 * @returns A Promise that resolves to the created User object.
 */
export async function createUser(name: string, email: string): Promise<User> {
	const user = new User();
	user.id = generateUserId();
	user.name = name;
	user.email = email;
	return user.save();
}

/**
 * Generates a unique user ID.
 * @returns {string} The generated user ID.
 */
function generateUserId() {
	return crypto.randomBytes(16).toString('hex');
}

/**
 * Creates a recipe and its associated ingredients.
 * 
 * @param app - The Fastify instance.
 * @param recipeName - The name of the recipe.
 * @param dietType - The diet type of the recipe.
 * @param cuisine - The cuisine of the recipe.
 * @param description - The description of the recipe.
 * @param ingredients - An array of ingredient objects, each containing the ingredient name.
 * @returns A Promise that resolves to the created recipe.
 */
export async function createRecipeAndIngredients(
	app: FastifyInstance,
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

/**
 * Creates a meal plan for a user.
 * 
 * @param app - The Fastify instance.
 * @param userId - The ID of the user.
 * @param mealType - The type of meal (e.g., breakfast, lunch, dinner).
 * @param dayOfWeek - The day of the week for the meal plan.
 * @param recipeId - The ID of the recipe.
 * @returns The created meal plan if successful, otherwise null.
 */
export async function createMealPlan(app: FastifyInstance, userId: number, mealType: string, dayOfWeek: string, recipeId: number) {
	const ings = await app.db.rpIngRel.find({
		relations: { ingredient: true },
		where: { recipe: { id: recipeId } },
	});

	const user = await app.db.user.findOne({ where: { id: userId.toString() } });
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
	return null;
}