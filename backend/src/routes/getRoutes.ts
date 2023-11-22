import { handleNotFoundResponse, getRecipes, getMealPlan } from '../HelperFunctions';
import { FastifyInstance } from "fastify";

export default async function getRoutes(app: FastifyInstance) {
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
		await getRecipes(app, reply, [
			{ name: 'cuisine', value: req.params.cuisine }
		]);
	});

	//GET all recipe for a particular dietType
	app.get("/recipes/dietType/:dietType", async (req: any, reply: any) => {
		await getRecipes(app, reply, [
			{ name: 'dietType', value: req.params.dietType }
		]);
	});

	//GET all recipe for a particular dietType and cuisine
	app.get("/recipes/:cuisine/:dietType", async (req: any, reply: any) => {
		await getRecipes(app, reply, [
			{ name: 'cuisine', value: req.params.cuisine },
			{ name: 'dietType', value: req.params.dietType },
		]);
	});

	//TODO: check if any needs to be removed
	//GET mealplans for a particular user
	app.get("/mealplan/:userid", async (req: any, reply: any) => {
		const userid = req.params.userid;
		await getMealPlan(app, reply, userid);
	});

	//convert dayOfWeek in the query param to lower case and then get mealplan for a user based on dayOfWeek
	//get mealplan for a user based on dayOfWeek
	app.get("/mealplan/:userid/:dayOfWeek", async (req: any, reply: any) => {
		const userid = req.params.userid;
		const dayOfWeek = req.params.dayOfWeek;
		await getMealPlan(app, reply, userid, dayOfWeek);
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
}