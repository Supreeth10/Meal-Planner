import { MigrationInterface, QueryRunner } from "typeorm";

export class RpIngRelUpdated1678244285578 implements MigrationInterface {
    name = 'RpIngRelUpdated1678244285578';

    public async up(queryRunner: QueryRunner): Promise<void> {
    	await queryRunner.query(`
			CREATE TABLE "recipe_ingredient_rel" (
				"id" SERIAL NOT NULL,
				"created_at" TIMESTAMP NOT NULL DEFAULT now(),
				"updated_at" TIMESTAMP NOT NULL DEFAULT now(),
				"recipeId" integer,
				"ingredientId" integer,
				CONSTRAINT "PK_561bb705ee4e3bc952555def91e" PRIMARY KEY ("id")
			)
		`);

    	await queryRunner.query(`
			ALTER TABLE "recipe_ingredient_rel"
			ADD CONSTRAINT "FK_34f5e74107467e7978cb88912ed"
			FOREIGN KEY ("recipeId") REFERENCES "recipes"("id") ON DELETE CASCADE ON UPDATE NO ACTION
		`);

    	await queryRunner.query(`
			ALTER TABLE "recipe_ingredient_rel"
			ADD CONSTRAINT "FK_2e0bf405f76d28a4d7d113f7ab0"
			FOREIGN KEY ("ingredientId") REFERENCES "ingredients"("id") ON DELETE CASCADE ON UPDATE NO ACTION
		`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    	await queryRunner.query(`
			ALTER TABLE "recipe_ingredient_rel"
			DROP CONSTRAINT "FK_2e0bf405f76d28a4d7d113f7ab0"
		`);
    	await queryRunner.query(`
			ALTER TABLE "recipe_ingredient_rel"
			DROP CONSTRAINT "FK_34f5e74107467e7978cb88912ed"
		`);
    	await queryRunner.query(`DROP TABLE "recipe_ingredient_rel"`);
    }

}
