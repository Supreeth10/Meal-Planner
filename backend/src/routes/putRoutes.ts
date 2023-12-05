import { updateShoppingListStatus, updateMealPlan } from '../HelperFunctions';
import { FastifyInstance } from "fastify";

/**
 * Class representing the PUT routes for the application.
 */
export class PutRoutes {
    private app: FastifyInstance;
    /**
     * Creates an instance of PutRoutes.
     * @param {FastifyInstance} app - The Fastify instance.
     */
    constructor(app: FastifyInstance) {
    	this.app = app;
    }

    /**
     * Register put routes for the application.
     */
    async registerRoutes() {
    	this.app.put("/shoppinglist", this.updateShoppingListStatusRoute.bind(this));
    	this.app.put("/mealplan", this.updateMealPlanRoute.bind(this));
    }

    /**
     * PUT ingredient's checked status to true for a user's shopping list
     * @route PUT /shoppinglist
     * @param {Request} req - The request object.
     * @param {Reply} reply - The reply object.
     */
    async updateShoppingListStatusRoute(req: any, reply: any) {
    	const { userId, ingredientId } = req.body;
    	if (!userId || !ingredientId) {
    		reply.status(400).send({ error: "userId and ingredientId are required" });
    	} else {
    		await updateShoppingListStatus(this.app, userId, ingredientId, reply);
    	}
    }

    /**
     * PUT existing mealplan for a user to update the recipe
     * @route PUT /mealplan
     * @param {Request} req - The request object.
     * @param {Reply} reply - The reply object.
     */
    async updateMealPlanRoute(req: any, reply: any) {
    	const { userId, mealType, dayOfWeek, recipeId } = req.body;
    	if (!userId || !mealType || !dayOfWeek || !recipeId) {
    		reply.status(400).send({ error: "userId, mealType, dayOfWeek, and recipeId are required" });
    	} else {
    		await updateMealPlan(this.app, userId, mealType, dayOfWeek, recipeId, reply);
    	}
    }
}
