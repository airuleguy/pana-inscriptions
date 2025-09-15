import { MigrationInterface, QueryRunner } from "typeorm";

export class MakeCoachLevelsOptional1757898997142 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Make level and level_description columns nullable in coaches table
        await queryRunner.query(`ALTER TABLE "coaches" ALTER COLUMN "level" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "coaches" ALTER COLUMN "level_description" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Revert level and level_description columns to NOT NULL in coaches table
        // Note: This will fail if there are existing NULL values
        await queryRunner.query(`ALTER TABLE "coaches" ALTER COLUMN "level" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "coaches" ALTER COLUMN "level_description" SET NOT NULL`);
    }

}
