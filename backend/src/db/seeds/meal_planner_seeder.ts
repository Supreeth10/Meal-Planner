/** @module Seeds/MealPlans */

import { faker } from "@faker-js/faker";
import { Seeder } from "../../lib/seed_manager";
import { MealPlans } from "../models/meal_plans";
import { User } from "../models/user";
import { FastifyInstance } from "fastify";
import { Recipes } from "../models/recipes";
import { GenerateRandomNumber } from "../../lib/helpers";


faker.seed(100);

enum DayOfWeek {
	monday,
	tuesday,
	wednesday,
	thursday,
	friday,
	saturday,
	sunday,
}

enum MealType {
	breakfast,
	lunch,
	dinner,
}

/**
 * Seeder class for MealPlans table
 */
export class MealPlansSeeder extends Seeder {
	/**
	 * Runs the MealPlans table's seed
	 * @function
	 * @param {FastifyInstance} app
	 * @returns {Promise<void>}
	 */

	override async run(app: FastifyInstance) {

		try {
			app.log.info("Seeding MealPlan...");
			await app.db.mp.delete({});
			const users = await User.find();

			for (let user of users) {
				await this.seedMealPlanForUser(user);
			}
			app.log.info("Finished seeding MealPlan");
		} catch (error) {
			app.log.error("Error in seeding MealPlan: ", error);
		}
	}
	/**
	 * Seeds the MealPlan for a specific user
	 * @function
	 * @param {any} user - The user object
	 * @returns {Promise<void>}
	 */
	private async seedMealPlanForUser(user: any) {
		const dayNames = Object.values(DayOfWeek).filter(value => isNaN(Number(value)));
		for (let dayOfWeek of dayNames) {

			const mealTypes = Object.values(MealType).filter(value => isNaN(Number(value)));
			for (let mealType of mealTypes) {

				const mealplan = new MealPlans();
				mealplan.user = user;
				mealplan.dayOfWeek = dayOfWeek as string;
				const recipe = await Recipes.find();
				if (recipe && recipe.length > 0) {
					mealplan.recipe = recipe[GenerateRandomNumber(recipe.length) - 1];
				} else {
					continue;
				}
				mealplan.mealType = mealType as string;
				await mealplan.save();
			}
		}
	}
}
export const MealPlansSeed = new MealPlansSeeder();
