import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRegistrationStatusManagement1735487500000 implements MigrationInterface {
    name = 'AddRegistrationStatusManagement1735487500000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create enum type for registration status
        await queryRunner.query(`CREATE TYPE "public"."registration_status_enum" AS ENUM('PENDING', 'SUBMITTED', 'REGISTERED')`);
        
        // Add status column to choreographies table with enum type and default 'PENDING'
        await queryRunner.query(`ALTER TABLE "choreographies" ADD "status" "public"."registration_status_enum" NOT NULL DEFAULT 'PENDING'`);
        
        // Update coaches status column to use enum type
        await queryRunner.query(`ALTER TABLE "coaches" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "coaches" ALTER COLUMN "status" TYPE "public"."registration_status_enum" USING "status"::"public"."registration_status_enum"`);
        await queryRunner.query(`ALTER TABLE "coaches" ALTER COLUMN "status" SET DEFAULT 'PENDING'`);
        
        // Update judges status column to use enum type  
        await queryRunner.query(`ALTER TABLE "judges" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "judges" ALTER COLUMN "status" TYPE "public"."registration_status_enum" USING "status"::"public"."registration_status_enum"`);
        await queryRunner.query(`ALTER TABLE "judges" ALTER COLUMN "status" SET DEFAULT 'PENDING'`);
        
        // Update existing 'REGISTERED' records to 'PENDING' as the new default for new registrations
        // Keep existing 'REGISTERED' records as they are already approved
        await queryRunner.query(`UPDATE "choreographies" SET "status" = 'REGISTERED' WHERE "status" = 'PENDING'`);
        await queryRunner.query(`UPDATE "coaches" SET "status" = 'REGISTERED' WHERE "status" = 'PENDING'`);
        await queryRunner.query(`UPDATE "judges" SET "status" = 'REGISTERED' WHERE "status" = 'PENDING'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Revert judges status column
        await queryRunner.query(`ALTER TABLE "judges" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "judges" ALTER COLUMN "status" TYPE character varying USING "status"::text`);
        await queryRunner.query(`ALTER TABLE "judges" ALTER COLUMN "status" SET DEFAULT 'REGISTERED'`);
        
        // Revert coaches status column
        await queryRunner.query(`ALTER TABLE "coaches" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "coaches" ALTER COLUMN "status" TYPE character varying USING "status"::text`);
        await queryRunner.query(`ALTER TABLE "coaches" ALTER COLUMN "status" SET DEFAULT 'REGISTERED'`);
        
        // Remove status column from choreographies
        await queryRunner.query(`ALTER TABLE "choreographies" DROP COLUMN "status"`);
        
        // Drop the enum type
        await queryRunner.query(`DROP TYPE "public"."registration_status_enum"`);
    }
} 