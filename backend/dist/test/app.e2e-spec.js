"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const request = require("supertest");
const app_module_1 = require("../src/app.module");
describe('AppController (e2e)', () => {
    let app;
    beforeEach(async () => {
        const moduleFixture = await testing_1.Test.createTestingModule({
            imports: [app_module_1.AppModule],
        }).compile();
        app = moduleFixture.createNestApplication();
        await app.init();
    });
    afterAll(async () => {
        await app.close();
    });
    it('/health (GET)', () => {
        return request(app.getHttpServer())
            .get('/health')
            .expect(200)
            .expect((res) => {
            expect(res.body.status).toBe('ok');
            expect(res.body.timestamp).toBeDefined();
            expect(res.body.uptime).toBeDefined();
        });
    });
    it('/api/v1/gymnasts (GET)', () => {
        return request(app.getHttpServer())
            .get('/api/v1/gymnasts')
            .expect(200);
    });
});
//# sourceMappingURL=app.e2e-spec.js.map