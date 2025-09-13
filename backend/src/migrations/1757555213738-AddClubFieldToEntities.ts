import { MigrationInterface, QueryRunner } from "typeorm";

export class AddClubFieldToEntities1757555213738 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add club column to choreographies table
        await queryRunner.query(`ALTER TABLE "choreographies" ADD "club" character varying`);
        
        // Add club column to coaches table
        await queryRunner.query(`ALTER TABLE "coaches" ADD "club" character varying`);
        
        // Add club column to judges table
        await queryRunner.query(`ALTER TABLE "judges" ADD "club" character varying`);
        
        // Add club column to support_staff table
        await queryRunner.query(`ALTER TABLE "support_staff" ADD "club" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove club column from support_staff table
        await queryRunner.query(`ALTER TABLE "support_staff" DROP COLUMN "club"`);
        
        // Remove club column from judges table
        await queryRunner.query(`ALTER TABLE "judges" DROP COLUMN "club"`);
        
        // Remove club column from coaches table
        await queryRunner.query(`ALTER TABLE "coaches" DROP COLUMN "club"`);
        
        // Remove club column from choreographies table
        await queryRunner.query(`ALTER TABLE "choreographies" DROP COLUMN "club"`);
    }

}
