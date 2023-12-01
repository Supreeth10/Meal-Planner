/** @module Seeds/User */
import { User } from "../models/user";
import { Seeder } from "../../lib/seed_manager";
import { FastifyInstance } from "fastify";
/**
 * Class representing the UserSeeder.
 * @class
 * @extends Seeder
 */
export class UserSeeder extends Seeder {
	/**
   * Runs the IPHistory table's seed
   * @function
   * @param {FastifyInstance} app
   * @returns {Promise<void>}
   */
	override async run(app: FastifyInstance) {
		app.log.info("Seeding Users...");
		await this.seedUsers(app);
	}
	/**
	 * Seeds the users.
	 * @async
	 * @function
	 * @param {FastifyInstance} app - The FastifyInstance object.
	 * @returns {Promise<void>}
	 */
	async seedUsers(app: FastifyInstance) {
		await app.db.user.delete({});
		let userIds = [
			"641800dc739976b7470d8074",
			"641800fa72c885b94f3b3d93",
			"641a4e6f8cca2db234b523f8",
		];
		let userEmails = ["user1@email.com", "user2@email.com", "user3@email.com"];
		for (let [index, id] of userIds.entries()) {
			await this.createUser(id, index, userEmails[index], app);
		}
	}
	/**
	 * Creates a user.
	 * @async
	 * @function
	 * @param {any} id - The user ID.
	 * @param {any} index - The index.
	 * @param {any} email - The user email.
	 * @param {FastifyInstance} app - The FastifyInstance object.
	 * @returns {Promise<void>}
	 */
	async createUser(id: any, index: any, email: any, app: FastifyInstance) {
		let user = new User();
		user.id = id;
		user.name = "user" + (index + 1);
		user.email = email;
		await user.save();
		app.log.info("Seeded user " + index);
	}
}

export const UserSeed = new UserSeeder();
