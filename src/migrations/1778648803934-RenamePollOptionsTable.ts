import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenamePollOptionsTable1778648803934 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.renameTable('pollOptions', 'poll_options');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.renameTable('poll_options', 'pollOptions');
  }
}
