"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddRegistrationStatusManagement1735487500000 = void 0;
class AddRegistrationStatusManagement1735487500000 {
    constructor() {
        this.name = 'AddRegistrationStatusManagement1735487500000';
    }
    async up(queryRunner) {
        await queryRunner.query(`CREATE TYPE "public"."registration_status_enum" AS ENUM('PENDING', 'SUBMITTED', 'REGISTERED')`);
        await queryRunner.query(`ALTER TABLE "choreographies" ADD "status" "public"."registration_status_enum" NOT NULL DEFAULT 'PENDING'`);
        await queryRunner.query(`ALTER TABLE "coaches" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "coaches" ALTER COLUMN "status" TYPE "public"."registration_status_enum" USING "status"::"public"."registration_status_enum"`);
        await queryRunner.query(`ALTER TABLE "coaches" ALTER COLUMN "status" SET DEFAULT 'PENDING'`);
        await queryRunner.query(`ALTER TABLE "judges" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "judges" ALTER COLUMN "status" TYPE "public"."registration_status_enum" USING "status"::"public"."registration_status_enum"`);
        await queryRunner.query(`ALTER TABLE "judges" ALTER COLUMN "status" SET DEFAULT 'PENDING'`);
        await queryRunner.query(`UPDATE "choreographies" SET "status" = 'REGISTERED' WHERE "status" = 'PENDING'`);
        await queryRunner.query(`UPDATE "coaches" SET "status" = 'REGISTERED' WHERE "status" = 'PENDING'`);
        await queryRunner.query(`UPDATE "judges" SET "status" = 'REGISTERED' WHERE "status" = 'PENDING'`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "judges" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "judges" ALTER COLUMN "status" TYPE character varying USING "status"::text`);
        await queryRunner.query(`ALTER TABLE "judges" ALTER COLUMN "status" SET DEFAULT 'REGISTERED'`);
        await queryRunner.query(`ALTER TABLE "coaches" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "coaches" ALTER COLUMN "status" TYPE character varying USING "status"::text`);
        await queryRunner.query(`ALTER TABLE "coaches" ALTER COLUMN "status" SET DEFAULT 'REGISTERED'`);
        await queryRunner.query(`ALTER TABLE "choreographies" DROP COLUMN "status"`);
        await queryRunner.query(`DROP TYPE "public"."registration_status_enum"`);
    }
}
exports.AddRegistrationStatusManagement1735487500000 = AddRegistrationStatusManagement1735487500000;
//# sourceMappingURL=1735487500000-AddRegistrationStatusManagement.js.map