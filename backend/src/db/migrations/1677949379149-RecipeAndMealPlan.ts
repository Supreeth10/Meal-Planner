import { MigrationInterface, QueryRunner } from "typeorm";

export class RecipeAndMealPlan1677949379149 implements MigrationInterface {
    name = 'RecipeAndMealPlan1677949379149';

    public async up(queryRunner: QueryRunner): Promise<void> {
    	await queryRunner.query(`
            CREATE TABLE "recipes" (
                "id" SERIAL NOT NULL,
                "recipeName" character varying NOT NULL,
                "dietType" character varying NOT NULL,
                "cuisine" character varying NOT NULL,
                "description" character varying(500) NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_8f09680a51bf3669c1598a21682" PRIMARY KEY ("id")
            )
        `);

    	await queryRunner.query(`
            CREATE TABLE "meal_plans" (
                "id" SERIAL NOT NULL,
                "mealId" integer NOT NULL,
                "mealType" character varying NOT NULL,
                "dayOfWeek" character varying NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "userId" integer,
                "recipeId" integer,
                CONSTRAINT "PK_6270d3206d074e2a2520f8d0a0b" PRIMARY KEY ("id")
            )
        `);

    	await queryRunner.query(`
            ALTER TABLE "meal_plans" 
            ADD CONSTRAINT "FK_1ce69a2fecf3cefd6a986c452c4"
            FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);

    	await queryRunner.query(`
            ALTER TABLE "meal_plans"
            ADD CONSTRAINT "FK_d75ac364c2bb928fca6239dc741"
            FOREIGN KEY ("recipeId") REFERENCES "recipes"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    	await queryRunner.query(`
            ALTER TABLE "meal_plans"
            DROP CONSTRAINT "FK_d75ac364c2bb928fca6239dc741"
        `);
    	await queryRunner.query(`
            ALTER TABLE "meal_plans"
            DROP CONSTRAINT "FK_1ce69a2fecf3cefd6a986c452c4"
        `);
    	await queryRunner.query(`DROP TABLE "meal_plans"`);
    	await queryRunner.query(`DROP TABLE "recipes"`);
    }

}
