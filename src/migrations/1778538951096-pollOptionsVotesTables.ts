import { MigrationInterface, QueryRunner } from "typeorm";

export class PollOptionsVotesTables1778538951096 implements MigrationInterface {
    name = 'PollOptionsVotesTables1778538951096'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "votes" ("id" SERIAL NOT NULL, "user_id" integer NOT NULL, "poll_id" integer NOT NULL, "option_id" integer NOT NULL, "state_id" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_24eabebd20cb8bf1130ba190965" UNIQUE ("user_id", "poll_id"), CONSTRAINT "PK_f3d9fd4a0af865152c3f59db8ff" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_649757246b34f4ab075819e62e" ON "votes" ("option_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_68941bbe0b1ae7bb272c30439b" ON "votes" ("state_id") `);
        await queryRunner.query(`ALTER TABLE "votes" ADD CONSTRAINT "FK_68941bbe0b1ae7bb272c30439b9" FOREIGN KEY ("state_id") REFERENCES "states"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "votes" ADD CONSTRAINT "FK_27be2cab62274f6876ad6a31641" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "votes" ADD CONSTRAINT "FK_176c7eedc76e4c0e41d17fe7a04" FOREIGN KEY ("poll_id") REFERENCES "poll"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "votes" ADD CONSTRAINT "FK_649757246b34f4ab075819e62e6" FOREIGN KEY ("option_id") REFERENCES "pollOptions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "votes" DROP CONSTRAINT "FK_649757246b34f4ab075819e62e6"`);
        await queryRunner.query(`ALTER TABLE "votes" DROP CONSTRAINT "FK_176c7eedc76e4c0e41d17fe7a04"`);
        await queryRunner.query(`ALTER TABLE "votes" DROP CONSTRAINT "FK_27be2cab62274f6876ad6a31641"`);
        await queryRunner.query(`ALTER TABLE "votes" DROP CONSTRAINT "FK_68941bbe0b1ae7bb272c30439b9"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_68941bbe0b1ae7bb272c30439b"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_649757246b34f4ab075819e62e"`);
        await queryRunner.query(`DROP TABLE "votes"`);
    }

}
