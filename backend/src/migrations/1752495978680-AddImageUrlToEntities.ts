import { MigrationInterface, QueryRunner } from "typeorm";

export class AddImageUrlToEntities1752495978680 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add image_url column to gymnasts table
        await queryRunner.query(`
            ALTER TABLE "gymnasts" 
            ADD COLUMN "image_url" character varying
        `);

        // Add image_url column to judges table
        await queryRunner.query(`
            ALTER TABLE "judges" 
            ADD COLUMN "image_url" character varying
        `);

        // Add image_url column to coaches table
        await queryRunner.query(`
            ALTER TABLE "coaches" 
            ADD COLUMN "image_url" character varying
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove image_url column from coaches table
        await queryRunner.query(`
            ALTER TABLE "coaches" 
            DROP COLUMN "image_url"
        `);

        // Remove image_url column from judges table
        await queryRunner.query(`
            ALTER TABLE "judges" 
            DROP COLUMN "image_url"
        `);

        // Remove image_url column from gymnasts table
        await queryRunner.query(`
            ALTER TABLE "gymnasts" 
            DROP COLUMN "image_url"
        `);
    }

}
