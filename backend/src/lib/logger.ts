/** @module Logger */
import fs from "fs";

const LOG_DIR_KEY = "VITE_LOGS_DIR";
const PRETTY_TARGET = "pino-pretty";

const logDirectory = import.meta.env[LOG_DIR_KEY];

// Create directory to store logs if it doesn't exist
if (!fs.existsSync(logDirectory)) {
	fs.mkdirSync(logDirectory, {recursive: true});
}

/**
 * Set logger options such that dev logs are pretty,
 * and prod logs are warn level saved to file
 */
const logger = import.meta.env.DEV
	? {
		transport: {

			target: PRETTY_TARGET,
			options: {
				translateTime: "HH:MM:ss.l",
				ignore: "pid,hostname",
			},
		},
		file: logDirectory + "/dev-logs.log",
	}
	: {
		level: "warn",
		file: logDirectory + "/warn-logs.log",
	};

export default logger;

// in-source testing
if (import.meta.vitest) {
	const {describe, it, expect} = import.meta.vitest;

	describe("logger", () => {
		it("creates log config object", () => {
			expect(logger)
				.toBeDefined();
		});
	});
}
