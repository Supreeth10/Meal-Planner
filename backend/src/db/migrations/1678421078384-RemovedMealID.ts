import { MigrationInterface, QueryRunner } from "typeorm";

export class RemovedMealID1678421078384 implements MigrationInterface {
    name = 'RemovedMealID1678421078384';

    public async up(queryRunner: QueryRunner): Promise<void> {
    	await queryRunner.query(`
            ALTER TABLE "meal_plans"
            DROP COLUMN "mealId"
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    	await queryRunner.query(`
            ALTER TABLE "meal_plans"
            ADD "mealId" integer NOT NULL
        `);
    }

}
