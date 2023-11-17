import { MigrationInterface, QueryRunner } from "typeorm";

export class SpListAndRpIngRelUpdated1678248239126 implements MigrationInterface {
    name = 'SpListAndRpIngRelUpdated1678248239126';

    public async up(queryRunner: QueryRunner): Promise<void> {
    	await queryRunner.query(`
            ALTER TABLE "shopping_list"
            DROP COLUMN "created_at"
        `);
    	await queryRunner.query(`
            ALTER TABLE "shopping_list"
            DROP COLUMN "updated_at"
        `);
    	await queryRunner.query(`
            ALTER TABLE "recipe_ingredient_rel"
            DROP COLUMN "created_at"
        `);
    	await queryRunner.query(`
            ALTER TABLE "recipe_ingredient_rel"
            DROP COLUMN "updated_at"
        `);
    	await queryRunner.query(`
            ALTER TABLE "shopping_list"
            ADD "check" boolean NOT NULL DEFAULT false
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    	await queryRunner.query(`
            ALTER TABLE "shopping_list"
            DROP COLUMN "check"
        `);
    	await queryRunner.query(`
            ALTER TABLE "recipe_ingredient_rel"
            ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()
        `);
    	await queryRunner.query(`
            ALTER TABLE "recipe_ingredient_rel"
            ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()
        `);
    	await queryRunner.query(`
            ALTER TABLE "shopping_list"
            ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()
        `);
    	await queryRunner.query(`
            ALTER TABLE "shopping_list"
            ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()
        `);
    }

}
