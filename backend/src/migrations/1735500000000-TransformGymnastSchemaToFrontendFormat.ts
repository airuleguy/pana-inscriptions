import { MigrationInterface, QueryRunner } from "typeorm";

export class TransformGymnastSchemaToFrontendFormat1735500000000 implements MigrationInterface {
    name = 'TransformGymnastSchemaToFrontendFormat1735500000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add new columns that match frontend expectations
        await queryRunner.query(`ALTER TABLE "gymnasts" ADD "fullName" character varying`);
        await queryRunner.query(`ALTER TABLE "gymnasts" ADD "dateOfBirth" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "gymnasts" ADD "licenseValid" boolean DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "gymnasts" ADD "licenseExpiryDate" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "gymnasts" ADD "age" integer`);
        await queryRunner.query(`ALTER TABLE "gymnasts" ADD "category" character varying`);

        // Update existing data to match frontend format
        // Transform gender from 'M'/'F' to 'MALE'/'FEMALE'
        await queryRunner.query(`UPDATE "gymnasts" SET "gender" = 'MALE' WHERE "gender" = 'M'`);
        await queryRunner.query(`UPDATE "gymnasts" SET "gender" = 'FEMALE' WHERE "gender" = 'F'`);

        // Set fullName by combining firstName and lastName
        await queryRunner.query(`UPDATE "gymnasts" SET "fullName" = "firstName" || ' ' || "lastName"`);

        // Convert birthDate string to dateOfBirth timestamp
        await queryRunner.query(`UPDATE "gymnasts" SET "dateOfBirth" = ("birthDate" || 'T00:00:00Z')::timestamp`);

        // Set licenseValid based on isLicensed
        await queryRunner.query(`UPDATE "gymnasts" SET "licenseValid" = "isLicensed"`);

        // Calculate age from birthDate (approximation for existing data)
        await queryRunner.query(`
            UPDATE "gymnasts" 
            SET "age" = EXTRACT(YEAR FROM CURRENT_DATE) - EXTRACT(YEAR FROM "dateOfBirth")
        `);

        // Determine category based on age
        await queryRunner.query(`UPDATE "gymnasts" SET "category" = 'YOUTH' WHERE "age" <= 15`);
        await queryRunner.query(`UPDATE "gymnasts" SET "category" = 'JUNIOR' WHERE "age" > 15 AND "age" <= 17`);
        await queryRunner.query(`UPDATE "gymnasts" SET "category" = 'SENIOR' WHERE "age" > 17`);

        // Make new columns non-nullable after data migration
        await queryRunner.query(`ALTER TABLE "gymnasts" ALTER COLUMN "fullName" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "gymnasts" ALTER COLUMN "dateOfBirth" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "gymnasts" ALTER COLUMN "licenseValid" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "gymnasts" ALTER COLUMN "age" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "gymnasts" ALTER COLUMN "category" SET NOT NULL`);

        // Remove old columns that are now redundant
        await queryRunner.query(`ALTER TABLE "gymnasts" DROP COLUMN "birthDate"`);
        await queryRunner.query(`ALTER TABLE "gymnasts" DROP COLUMN "isLicensed"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Add back old columns
        await queryRunner.query(`ALTER TABLE "gymnasts" ADD "birthDate" character varying`);
        await queryRunner.query(`ALTER TABLE "gymnasts" ADD "isLicensed" boolean DEFAULT true`);

        // Restore old data format
        // Convert dateOfBirth back to birthDate string
        await queryRunner.query(`UPDATE "gymnasts" SET "birthDate" = TO_CHAR("dateOfBirth", 'YYYY-MM-DD')`);
        
        // Set isLicensed based on licenseValid
        await queryRunner.query(`UPDATE "gymnasts" SET "isLicensed" = "licenseValid"`);

        // Transform gender back from 'MALE'/'FEMALE' to 'M'/'F'
        await queryRunner.query(`UPDATE "gymnasts" SET "gender" = 'M' WHERE "gender" = 'MALE'`);
        await queryRunner.query(`UPDATE "gymnasts" SET "gender" = 'F' WHERE "gender" = 'FEMALE'`);

        // Make old columns non-nullable
        await queryRunner.query(`ALTER TABLE "gymnasts" ALTER COLUMN "birthDate" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "gymnasts" ALTER COLUMN "isLicensed" SET NOT NULL`);

        // Remove new columns
        await queryRunner.query(`ALTER TABLE "gymnasts" DROP COLUMN "category"`);
        await queryRunner.query(`ALTER TABLE "gymnasts" DROP COLUMN "age"`);
        await queryRunner.query(`ALTER TABLE "gymnasts" DROP COLUMN "licenseExpiryDate"`);
        await queryRunner.query(`ALTER TABLE "gymnasts" DROP COLUMN "licenseValid"`);
        await queryRunner.query(`ALTER TABLE "gymnasts" DROP COLUMN "dateOfBirth"`);
        await queryRunner.query(`ALTER TABLE "gymnasts" DROP COLUMN "fullName"`);
    }

} 