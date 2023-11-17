import { MigrationInterface, QueryRunner } from "typeorm";

export class UserUpdated1679295898488 implements MigrationInterface {
    name = 'UserUpdated1679295898488';

    public async up(queryRunner: QueryRunner): Promise<void> {
    	await queryRunner.query(`
            ALTER TABLE "ip_history"
            DROP CONSTRAINT "FK_b3658d04b80507751b273bf038b"
        `);
    	await queryRunner.query(`
            ALTER TABLE "ip_history"
            DROP COLUMN "userId"
        `);
    	await queryRunner.query(`
            ALTER TABLE "ip_history"
            ADD "userId" character varying
        `);
    	await queryRunner.query(`
            ALTER TABLE "shopping_list"
            DROP CONSTRAINT "FK_38e60f213f35fb8fe51d3bf41e4"
        `);
    	await queryRunner.query(`
            ALTER TABLE "shopping_list"
            DROP COLUMN "userId"
        `);
    	await queryRunner.query(`
            ALTER TABLE "shopping_list"
            ADD "userId" character varying
        `);
    	await queryRunner.query(`
            ALTER TABLE "meal_plans"
            DROP CONSTRAINT "FK_1ce69a2fecf3cefd6a986c452c4"
        `);
    	await queryRunner.query(`
            ALTER TABLE "meal_plans"
            DROP COLUMN "userId"
        `);
    	await queryRunner.query(`
            ALTER TABLE "meal_plans"
            ADD "userId" character varying
        `);
    	await queryRunner.query(`
            ALTER TABLE "users"
            DROP CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433"
        `);
    	await queryRunner.query(`
            ALTER TABLE "users"
            DROP COLUMN "id"
        `);
    	await queryRunner.query(`
            ALTER TABLE "users"
            ADD "id" character varying NOT NULL
        `);
    	await queryRunner.query(`
            ALTER TABLE "users"
            ADD CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433"
            PRIMARY KEY ("id")
        `);
    	await queryRunner.query(`
            ALTER TABLE "ip_history"
            ADD CONSTRAINT "FK_b3658d04b80507751b273bf038b"
            FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    	await queryRunner.query(`
            ALTER TABLE "shopping_list"
            ADD CONSTRAINT "FK_38e60f213f35fb8fe51d3bf41e4"
            FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    	await queryRunner.query(`
            ALTER TABLE "meal_plans"
            ADD CONSTRAINT "FK_1ce69a2fecf3cefd6a986c452c4"
            FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    	await queryRunner.query(`
            ALTER TABLE "meal_plans"
            DROP CONSTRAINT "FK_1ce69a2fecf3cefd6a986c452c4"
        `);
    	await queryRunner.query(`
            ALTER TABLE "shopping_list"
            DROP CONSTRAINT "FK_38e60f213f35fb8fe51d3bf41e4"
        `);
    	await queryRunner.query(`
            ALTER TABLE "ip_history"
            DROP CONSTRAINT "FK_b3658d04b80507751b273bf038b"
        `);
    	await queryRunner.query(`
            ALTER TABLE "users"
            DROP CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433"
        `);
    	await queryRunner.query(`
            ALTER TABLE "users"
            DROP COLUMN "id"
        `);
    	await queryRunner.query(`
            ALTER TABLE "users"
            ADD "id" SERIAL NOT NULL
        `);
    	await queryRunner.query(`
            ALTER TABLE "users"
            ADD CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433"
            PRIMARY KEY ("id")
        `);
    	await queryRunner.query(`
            ALTER TABLE "meal_plans"
            DROP COLUMN "userId"
        `);
    	await queryRunner.query(`
            ALTER TABLE "meal_plans"
            ADD "userId" integer
        `);
    	await queryRunner.query(`
            ALTER TABLE "meal_plans"
            ADD CONSTRAINT "FK_1ce69a2fecf3cefd6a986c452c4" 
            FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    	await queryRunner.query(`
            ALTER TABLE "shopping_list"
            DROP COLUMN "userId"
        `);
    	await queryRunner.query(`
            ALTER TABLE "shopping_list"
            ADD "userId" integer
        `);
    	await queryRunner.query(`
            ALTER TABLE "shopping_list"
            ADD CONSTRAINT "FK_38e60f213f35fb8fe51d3bf41e4"
            FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    	await queryRunner.query(`
            ALTER TABLE "ip_history"
            DROP COLUMN "userId"
        `);
    	await queryRunner.query(`
            ALTER TABLE "ip_history"
            ADD "userId" integer
        `);
    	await queryRunner.query(`
            ALTER TABLE "ip_history"
            ADD CONSTRAINT "FK_b3658d04b80507751b273bf038b"
            FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    }

}
