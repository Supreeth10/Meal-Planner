import { FastifyInstance } from "fastify";

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