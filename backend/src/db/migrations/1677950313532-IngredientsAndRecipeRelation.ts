import { MigrationInterface, QueryRunner } from "typeorm";

export class IngredientsAndRecipeRelation1677950313532 implements MigrationInterface {
    name = 'IngredientsAndRecipeRelation1677950313532';

    public async up(queryRunner: QueryRunner): Promise<void> {
    	await queryRunner.query(`
            CREATE TABLE "ingredients" (
                "id" SERIAL NOT NULL,
                "ingName" character varying(100) NOT NULL,
                CONSTRAINT "PK_9240185c8a5507251c9f15e0649" PRIMARY KEY ("id")
            )
        `);

    	await queryRunner.query(`
            CREATE TABLE "ingredients_rel_recipes" (
                "ingredientsId" integer NOT NULL,
                "recipesId" integer NOT NULL,
                CONSTRAINT "PK_7f972bbb1b4e2d35e66c1fea202" PRIMARY KEY ("ingredientsId", "recipesId")
            )
        `);

    	await queryRunner.query(`
            CREATE INDEX "IDX_5d1e5344df1632d69a18615e74" ON "ingredients_rel_recipes" ("ingredientsId")
        `);

    	await queryRunner.query(`
            CREATE INDEX "IDX_121e9809a4efc98ad498839629" ON "ingredients_rel_recipes" ("recipesId")
        `);

    	await queryRunner.query(`
            ALTER TABLE "ingredients_rel_recipes"
            ADD CONSTRAINT "FK_5d1e5344df1632d69a18615e74f"
            FOREIGN KEY ("ingredientsId") REFERENCES "ingredients"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);

    	await queryRunner.query(`
            ALTER TABLE "ingredients_rel_recipes"
            ADD CONSTRAINT "FK_121e9809a4efc98ad4988396297"
            FOREIGN KEY ("recipesId") REFERENCES "recipes"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    	await queryRunner.query(`
            ALTER TABLE "ingredients_rel_recipes"
            DROP CONSTRAINT "FK_121e9809a4efc98ad4988396297"
        `);
    	await queryRunner.query(`
            ALTER TABLE "ingredients_rel_recipes"
            DROP CONSTRAINT "FK_5d1e5344df1632d69a18615e74f"
        `);
    	await queryRunner.query(`DROP INDEX "public"."IDX_121e9809a4efc98ad498839629"`);
    	await queryRunner.query(`DROP INDEX "public"."IDX_5d1e5344df1632d69a18615e74"`);
    	await queryRunner.query(`DROP TABLE "ingredients_rel_recipes"`);
    	await queryRunner.query(`DROP TABLE "ingredients"`);
    }

}
