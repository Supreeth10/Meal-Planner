import { FastifyInstance } from "fastify";
import { Brackets } from "typeorm";

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