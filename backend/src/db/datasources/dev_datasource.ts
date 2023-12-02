// We need dotenv here because our datasources are processed from CLI in addition to vite
import dotenv from "dotenv";
import { DataSource } from "typeorm";
// Similar reasoning as above, we need to add the file extensions to this file's imports for CLI usage
import { User } from "../models/user";
import { IPHistory } from "../models/ip_history";
import { InitialUserAndIP1677727436444 } from "../migrations/1677727436444-InitialUserAndIP.js";
import { MealPlans } from "../models/meal_plans.js";
import { Recipes } from "../models/recipes.js";
import { RecipeAndMealPlan1677949379149 } from "../migrations/1677949379149-RecipeAndMealPlan.js";
import { Ingredients } from "../models/ingredients.js";
import { IngredientsAndRecipeRelation1677950313532 } from "../migrations/1677950313532-IngredientsAndRecipeRelation.js";
import { ShoppingList } from "../models/shopping_list.js";
import { ShoppingListInitUserAndIngRel1677951945972 } from "../migrations/1677951945972-ShoppingListInit_UserAndIngRel.js";
import { RecipeIngredientRel } from "../models/recipe_ingredient_rel.js";
import { RpIngRelUpdated1678244285578 } from "../migrations/1678244285578-RpIngRelUpdated.js";
import { SpListAndRpIngRelUpdated1678248239126 } from "../migrations/1678248239126-SpListAndRpIngRelUpdated.js";
import { RemovedMealID1678421078384 } from "../migrations/1678421078384-RemovedMealID.js";
import { UserUpdated1679295898488 } from "../migrations/1679295898488-UserUpdated.js";

dotenv.config();

// @ts-ignore
const env = process.env;
/**
 * The data source configuration for the development environment.
 */
export const AppDataSource = new DataSource({
	type: "postgres",
	host: env.VITE_DB_HOST,
	port: Number(env.VITE_DB_PORT),
	username: env.VITE_DB_USER,
	password: env.VITE_DB_PASS,
	database: env.VITE_DB_NAME,

	
	/**
	 * The entities used by TypeORM to create tables in the database.
	 * Entities are used to tell TypeORM which tables to create in the database
	 */
	entities: [
		User,
		IPHistory,
		MealPlans,
		Recipes,
		Ingredients,
		ShoppingList,
		RecipeIngredientRel,
	],
	/**
	 * The migrations used by TypeORM to manage database schema changes.
	 */
	migrations: [
		InitialUserAndIP1677727436444,
		RecipeAndMealPlan1677949379149,
		IngredientsAndRecipeRelation1677950313532,
		ShoppingListInitUserAndIngRel1677951945972,
		RpIngRelUpdated1678244285578,
		SpListAndRpIngRelUpdated1678248239126,
		RemovedMealID1678421078384,
		UserUpdated1679295898488,
	],
	/**
	 * Whether to automatically synchronize the database schema on application startup.
	 * Set to `false` to disable automatic synchronization.
	 */
	synchronize: false,
});
