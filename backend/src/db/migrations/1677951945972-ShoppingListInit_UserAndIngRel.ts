import { MigrationInterface, QueryRunner } from "typeorm";

export class ShoppingListInitUserAndIngRel1677951945972 implements MigrationInterface {
    name = 'ShoppingListInitUserAndIngRel1677951945972';

    public async up(queryRunner: QueryRunner): Promise<void> {
    	await queryRunner.query(`
            CREATE TABLE "shopping_list" (
                "id" SERIAL NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "userId" integer,
                "ingId" integer,
                CONSTRAINT "PK_87d9431f2ea573a79370742b474" PRIMARY KEY ("id")
            )
        `);

    	await queryRunner.query(`
            ALTER TABLE "shopping_list"
            ADD CONSTRAINT "FK_38e60f213f35fb8fe51d3bf41e4"
            FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);

    	await queryRunner.query(`
            ALTER TABLE "shopping_list"
            ADD CONSTRAINT "FK_3fb484a6831f54b2101d5c971e2"
            FOREIGN KEY ("ingId") REFERENCES "ingredients"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    	await queryRunner.query(`
            ALTER TABLE "shopping_list"
            DROP CONSTRAINT "FK_3fb484a6831f54b2101d5c971e2"
        `);
    	await queryRunner.query(`
            ALTER TABLE "shopping_list"
            DROP CONSTRAINT "FK_38e60f213f35fb8fe51d3bf41e4"
        `);
    	await queryRunner.query(`DROP TABLE "shopping_list"`);
    }

}
