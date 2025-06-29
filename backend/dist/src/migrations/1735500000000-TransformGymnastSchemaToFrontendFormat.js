"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransformGymnastSchemaToFrontendFormat1735500000000 = void 0;
class TransformGymnastSchemaToFrontendFormat1735500000000 {
    constructor() {
        this.name = 'TransformGymnastSchemaToFrontendFormat1735500000000';
    }
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "gymnasts" ADD "fullName" character varying`);
        await queryRunner.query(`ALTER TABLE "gymnasts" ADD "dateOfBirth" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "gymnasts" ADD "licenseValid" boolean DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "gymnasts" ADD "licenseExpiryDate" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "gymnasts" ADD "age" integer`);
        await queryRunner.query(`ALTER TABLE "gymnasts" ADD "category" character varying`);
        await queryRunner.query(`UPDATE "gymnasts" SET "gender" = 'MALE' WHERE "gender" = 'M'`);
        await queryRunner.query(`UPDATE "gymnasts" SET "gender" = 'FEMALE' WHERE "gender" = 'F'`);
        await queryRunner.query(`UPDATE "gymnasts" SET "fullName" = "firstName" || ' ' || "lastName"`);
        await queryRunner.query(`UPDATE "gymnasts" SET "dateOfBirth" = ("birthDate" || 'T00:00:00Z')::timestamp`);
        await queryRunner.query(`UPDATE "gymnasts" SET "licenseValid" = "isLicensed"`);
        await queryRunner.query(`
            UPDATE "gymnasts" 
            SET "age" = EXTRACT(YEAR FROM CURRENT_DATE) - EXTRACT(YEAR FROM "dateOfBirth")
        `);
        await queryRunner.query(`UPDATE "gymnasts" SET "category" = 'YOUTH' WHERE "age" <= 15`);
        await queryRunner.query(`UPDATE "gymnasts" SET "category" = 'JUNIOR' WHERE "age" > 15 AND "age" <= 17`);
        await queryRunner.query(`UPDATE "gymnasts" SET "category" = 'SENIOR' WHERE "age" > 17`);
        await queryRunner.query(`ALTER TABLE "gymnasts" ALTER COLUMN "fullName" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "gymnasts" ALTER COLUMN "dateOfBirth" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "gymnasts" ALTER COLUMN "licenseValid" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "gymnasts" ALTER COLUMN "age" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "gymnasts" ALTER COLUMN "category" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "gymnasts" DROP COLUMN "birthDate"`);
        await queryRunner.query(`ALTER TABLE "gymnasts" DROP COLUMN "isLicensed"`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "gymnasts" ADD "birthDate" character varying`);
        await queryRunner.query(`ALTER TABLE "gymnasts" ADD "isLicensed" boolean DEFAULT true`);
        await queryRunner.query(`UPDATE "gymnasts" SET "birthDate" = TO_CHAR("dateOfBirth", 'YYYY-MM-DD')`);
        await queryRunner.query(`UPDATE "gymnasts" SET "isLicensed" = "licenseValid"`);
        await queryRunner.query(`UPDATE "gymnasts" SET "gender" = 'M' WHERE "gender" = 'MALE'`);
        await queryRunner.query(`UPDATE "gymnasts" SET "gender" = 'F' WHERE "gender" = 'FEMALE'`);
        await queryRunner.query(`ALTER TABLE "gymnasts" ALTER COLUMN "birthDate" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "gymnasts" ALTER COLUMN "isLicensed" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "gymnasts" DROP COLUMN "category"`);
        await queryRunner.query(`ALTER TABLE "gymnasts" DROP COLUMN "age"`);
        await queryRunner.query(`ALTER TABLE "gymnasts" DROP COLUMN "licenseExpiryDate"`);
        await queryRunner.query(`ALTER TABLE "gymnasts" DROP COLUMN "licenseValid"`);
        await queryRunner.query(`ALTER TABLE "gymnasts" DROP COLUMN "dateOfBirth"`);
        await queryRunner.query(`ALTER TABLE "gymnasts" DROP COLUMN "fullName"`);
    }
}
exports.TransformGymnastSchemaToFrontendFormat1735500000000 = TransformGymnastSchemaToFrontendFormat1735500000000;
//# sourceMappingURL=1735500000000-TransformGymnastSchemaToFrontendFormat.js.map