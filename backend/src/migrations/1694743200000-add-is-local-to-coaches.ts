import { MigrationInterface, QueryRunner } from "typeorm";

export class AddIsLocalToCoaches1694743200000 implements MigrationInterface {
    name = 'AddIsLocalToCoaches1694743200000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "coaches" ADD COLUMN "is_local" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "coaches" DROP COLUMN "is_local"`);
    }
}
