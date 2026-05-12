import { MigrationInterface, QueryRunner } from "typeorm";

export class PollAndPollOptions1778493326784 implements MigrationInterface {
    name = 'PollAndPollOptions1778493326784'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "pollOptions" ("id" SERIAL NOT NULL, "option_text" text NOT NULL, "poll_id" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_1023815ec6f82aeaf986195e370" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_04fdfbdaa40824d4af8e934131" ON "pollOptions" ("poll_id") `);
        await queryRunner.query(`CREATE TYPE "public"."poll_status_enum" AS ENUM('draft', 'active', 'closed')`);
        await queryRunner.query(`CREATE TABLE "poll" ("id" SERIAL NOT NULL, "title" character varying NOT NULL, "description" text NOT NULL, "status" "public"."poll_status_enum" NOT NULL DEFAULT 'draft', "created_by" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_03b5cf19a7f562b231c3458527e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_bea3b60afc9daf0313f518e143" ON "poll" ("status") `);
        await queryRunner.query(`CREATE INDEX "IDX_e7e3b513bd772b201cb48f8755" ON "poll" ("created_by") `);
        await queryRunner.query(`ALTER TABLE "pollOptions" ADD CONSTRAINT "FK_04fdfbdaa40824d4af8e9341311" FOREIGN KEY ("poll_id") REFERENCES "poll"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "poll" ADD CONSTRAINT "FK_e7e3b513bd772b201cb48f87557" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "poll" DROP CONSTRAINT "FK_e7e3b513bd772b201cb48f87557"`);
        await queryRunner.query(`ALTER TABLE "pollOptions" DROP CONSTRAINT "FK_04fdfbdaa40824d4af8e9341311"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e7e3b513bd772b201cb48f8755"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_bea3b60afc9daf0313f518e143"`);
        await queryRunner.query(`DROP TABLE "poll"`);
        await queryRunner.query(`DROP TYPE "public"."poll_status_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_04fdfbdaa40824d4af8e934131"`);
        await queryRunner.query(`DROP TABLE "pollOptions"`);
    }

}
