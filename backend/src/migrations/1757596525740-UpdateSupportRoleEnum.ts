import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateSupportRoleEnum1757596525740 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Check if the enum type already exists
        const enumExists = await queryRunner.query(`
            SELECT 1 FROM pg_type WHERE typname = 'support_role_enum'
        `);
        
        if (!enumExists.length) {
            // Create the new enum type
            await queryRunner.query(`CREATE TYPE "support_role_enum" AS ENUM('DELEGATION_LEADER', 'MEDIC', 'COMPANION')`);
        }
        
        // Check if the column is already using the enum type
        const columnInfo = await queryRunner.query(`
            SELECT data_type, udt_name 
            FROM information_schema.columns 
            WHERE table_name = 'support_staff' AND column_name = 'role'
        `);
        
        if (columnInfo[0]?.udt_name === 'support_role_enum') {
            // Column is already using the enum, skip migration
            return;
        }
        
        // Add a temporary column with the new enum type
        await queryRunner.query(`ALTER TABLE "support_staff" ADD "role_new" "support_role_enum"`);
        
        // Migrate existing data to new enum values
        // Map old values to new enum values
        await queryRunner.query(`UPDATE "support_staff" SET "role_new" = 'DELEGATION_LEADER' WHERE "role" = 'DELEGATE' OR "role" = 'DELEGATION_LEADER'`);
        await queryRunner.query(`UPDATE "support_staff" SET "role_new" = 'MEDIC' WHERE "role" = 'MEDICAL' OR "role" = 'MEDIC'`);
        await queryRunner.query(`UPDATE "support_staff" SET "role_new" = 'COMPANION' WHERE "role" = 'SUPPORT' OR "role" = 'OTHER' OR "role" = 'MANAGER' OR "role" = 'PHYSIO' OR "role" = 'COMPANION'`);
        
        // Set default value for any remaining null values
        await queryRunner.query(`UPDATE "support_staff" SET "role_new" = 'COMPANION' WHERE "role_new" IS NULL`);
        
        // Drop the old column
        await queryRunner.query(`ALTER TABLE "support_staff" DROP COLUMN "role"`);
        
        // Rename the new column to the original name
        await queryRunner.query(`ALTER TABLE "support_staff" RENAME COLUMN "role_new" TO "role"`);
        
        // Make the column NOT NULL
        await queryRunner.query(`ALTER TABLE "support_staff" ALTER COLUMN "role" SET NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Add a temporary varchar column
        await queryRunner.query(`ALTER TABLE "support_staff" ADD "role_temp" VARCHAR`);
        
        // Migrate data back to string values
        await queryRunner.query(`UPDATE "support_staff" SET "role_temp" = 'DELEGATE' WHERE "role" = 'DELEGATION_LEADER'`);
        await queryRunner.query(`UPDATE "support_staff" SET "role_temp" = 'MEDICAL' WHERE "role" = 'MEDIC'`);
        await queryRunner.query(`UPDATE "support_staff" SET "role_temp" = 'SUPPORT' WHERE "role" = 'COMPANION'`);
        
        // Drop the enum column
        await queryRunner.query(`ALTER TABLE "support_staff" DROP COLUMN "role"`);
        
        // Rename temp column back
        await queryRunner.query(`ALTER TABLE "support_staff" RENAME COLUMN "role_temp" TO "role"`);
        
        // Drop the enum type
        await queryRunner.query(`DROP TYPE "support_role_enum"`);
    }

}
