/** @module Seeds/User */
import { User } from "../models/user";
import { Seeder } from "../../lib/seed_manager";
import { FastifyInstance } from "fastify";
import { Recipes } from "../models/recipes";
import { faker } from "@faker-js/faker";
import { GenerateRandomNumber } from "../../lib/helpers";

enum CuisineType {
	American = 1,
	Asian = 2,
	British = 3,
	Cajun = 4,
}

enum DietType {
	vegan = 1,
	vegetarian = 2,
	pescatarian = 3,
	NonVegetarian = 4,
}
/**
 * Class responsible for seeding the recipe data.
 */
export class RecipeSeeder extends Seeder {
	/**
   * Runs the IPHistory table's seed
   * @function
   * @param {FastifyInstance} app
   * @returns {Promise<void>}
   */

	override async run(app: FastifyInstance) {

		try {
			app.log.info("Seeding recipe...");
			await app.db.rp.delete({});
			const users = await User.find();
			users.forEach(() => this.seedRecipeForUser());
			app.log.info("Finished seeding recipe");

		} catch (error) {
			app.log.error("Error in seeding recipe: ", error);
		}
	}
	/**
	 * Seeds a recipe for a user.
	 * @returns {Promise<void>}
	 */
	private async seedRecipeForUser() {
		let recipe = new Recipes();
		recipe.recipeName = faker.lorem.words(3);
		recipe.dietType = DietType[GenerateRandomNumber(4)];
		recipe.cuisine = CuisineType[GenerateRandomNumber(4)];
		recipe.description = faker.lorem.words(10);
		await recipe.save();
	}

}

// generate default instance for convenience
export const RecipeSeed = new RecipeSeeder();
