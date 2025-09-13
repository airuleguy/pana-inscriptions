import { MigrationInterface, QueryRunner } from "typeorm";

export class AddImageUrlToSupport1710345600000 implements MigrationInterface {
    name = 'AddImageUrlToSupport1710345600000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "support_staff" ADD COLUMN "image_url" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "support_staff" DROP COLUMN "image_url"`);
    }
}
