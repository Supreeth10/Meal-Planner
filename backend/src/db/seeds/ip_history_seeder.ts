/** @module Seeds/IPHistory */

import { faker } from "@faker-js/faker";
import { Seeder } from "../../lib/seed_manager";
import { IPHistory } from "../models/ip_history";
import { User } from "../models/user";
import { FastifyInstance } from "fastify";


faker.seed(100);

/**
 * Seeder class for populating the IPHistory table.
 */
export class IPHistorySeeder extends Seeder {

	/**
   * Runs the IPHistory table's seed
   * @function
   * @param {FastifyInstance} app
   * @returns {Promise<void>}
   */
	override async run(app: FastifyInstance) {
		try {
			app.log.info("Seeding IP Histories...");
			await app.db.ip.delete({});
			const users = await User.find();

			for (const user of users) {
				await this.seedIPHistoryForUser(user, app);
			}
		} catch (error) {
			app.log.error("Error in seeding IP history: ", error);
		}
	}
	/**
	 * Seeds IP history for a specific user.
	 * @param {any} user - The user object.
	 * @param {FastifyInstance} app - The FastifyInstance object.
	 * @returns {Promise<void>}
	 */
	private async seedIPHistoryForUser(user: any, app: FastifyInstance) {
		await this.createAndSaveIPHistory(user);
		await this.createAndSaveIPHistory(user);

		app.log.info("Finished seeding IP history pair for user: " + user.id);
	}
	/**
	 * Creates and saves an IPHistory record for a user.
	 * @param {any} user - The user object.
	 * @returns {Promise<void>}
	 */
	private async createAndSaveIPHistory(user: any) {
		let ipHistory = new IPHistory();
		ipHistory.user = user;
		ipHistory.ip = faker.internet.ip();
		await ipHistory.save();
	}
}

export const IPHistorySeed = new IPHistorySeeder();
