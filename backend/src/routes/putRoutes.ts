import { updateShoppingListStatus, updateMealPlan } from '../HelperFunctions';
import { FastifyInstance, FastifyReply } from "fastify";

/**
 * This module exports an async function that sets up PUT routes for the Fastify application.
 * @module PutRoutes
 * @param {FastifyInstance} app - The Fastify server instance.
 */
export default async function putRoutes(app: FastifyInstance) {

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

}