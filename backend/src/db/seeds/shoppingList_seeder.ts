/** @module Seeds/User */
import { Seeder } from "../../lib/seed_manager";
import { FastifyInstance } from "fastify";
import { User } from "../models/user";
import { ShoppingList } from "../models/shopping_list";

/**
 * Seeder class for populating the shopping list table with data.
 */
export class ShoppingListSeeder extends Seeder {
	/**
	 * Runs the IPHistory table's seed
	 * @function
	 * @param {FastifyInstance} app
	 * @returns {Promise<void>}
	 */
	override async run(app: FastifyInstance) {
		app.log.info("Seeding ingredients...");
		await app.db.sl.delete({});
		const users = await User.find();

		for (const user of users) {
			const mealPlans = await this.findMealPlans(user.id, app);

			for (const mealPlan of mealPlans) {
				const recipeIngredients = await this.findIngredients(mealPlan.recipe.id, app);

				for (const recipe of recipeIngredients) {
					const sl = new ShoppingList();
					sl.user = user;
					sl.ing = recipe.ingredient;
					await sl.save();
				}
			}
		}
		app.log.info("Finished seeding ingredients");
	}
	/**
	 * Finds the meal plans for a given user.
	 * @function
	 * @param {any} userId - The ID of the user.
	 * @param {FastifyInstance} app - The FastifyInstance object representing the Fastify application.
	 * @returns {Promise<any[]>} - An array of meal plans.
	 */
	async findMealPlans(userId: any, app: FastifyInstance) {
		return app.db.mp.find({
			relations: {
				recipe: true,
			},
			where: {
				user: {
					id: userId,
				},
			},
		});
	}
	/**
	 * Finds the ingredients for a given recipe.
	 * @function
	 * @param {any} recipeId - The ID of the recipe.
	 * @param {FastifyInstance} app - The FastifyInstance object representing the Fastify application.
	 * @returns {Promise<any[]>} - An array of ingredients.
	 */
	async findIngredients(recipeId: any, app: FastifyInstance) {
		return app.db.rpIngRel.find({
			relations: {
				ingredient: true,
			},
			where: {
				recipe: {
					id: recipeId,
				},
			},
		});
	}
}

export const ShoppingListSeed = new ShoppingListSeeder();
