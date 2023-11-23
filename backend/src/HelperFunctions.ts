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

export async function handleNotFoundResponse(reply: any, params: param[]) {
	let errMsg = {
		error: `No record found for ${params.map(param => `${param.name}: ${param.value}`).join(', ')}`,
	};
	reply.status(404).send(errMsg);
}

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

export async function createUser(name: string, email: string): Promise<User> {
	const user = new User();
	user.id = generateUserId();
	user.name = name;
	user.email = email;
	return user.save();
}

function generateUserId() {
	return crypto.randomBytes(16).toString('hex');
}

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