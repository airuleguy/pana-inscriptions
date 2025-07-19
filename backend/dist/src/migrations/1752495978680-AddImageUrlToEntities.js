"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddImageUrlToEntities1752495978680 = void 0;
class AddImageUrlToEntities1752495978680 {
    async up(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE "gymnasts" 
            ADD COLUMN "image_url" character varying
        `);
        await queryRunner.query(`
            ALTER TABLE "judges" 
            ADD COLUMN "image_url" character varying
        `);
        await queryRunner.query(`
            ALTER TABLE "coaches" 
            ADD COLUMN "image_url" character varying
        `);
    }
    async down(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE "coaches" 
            DROP COLUMN "image_url"
        `);
        await queryRunner.query(`
            ALTER TABLE "judges" 
            DROP COLUMN "image_url"
        `);
        await queryRunner.query(`
            ALTER TABLE "gymnasts" 
            DROP COLUMN "image_url"
        `);
    }
}
exports.AddImageUrlToEntities1752495978680 = AddImageUrlToEntities1752495978680;
//# sourceMappingURL=1752495978680-AddImageUrlToEntities.js.map