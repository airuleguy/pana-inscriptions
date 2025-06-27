"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.databaseConfig = void 0;
const gymnast_entity_1 = require("../entities/gymnast.entity");
const choreography_entity_1 = require("../entities/choreography.entity");
const databaseConfig = async (configService) => ({
    type: 'postgres',
    url: configService.get('DATABASE_URL'),
    entities: [gymnast_entity_1.Gymnast, choreography_entity_1.Choreography],
    synchronize: configService.get('NODE_ENV') === 'development',
    logging: configService.get('NODE_ENV') === 'development',
    ssl: configService.get('NODE_ENV') === 'production' ? { rejectUnauthorized: false } : false,
    retryAttempts: 3,
    retryDelay: 3000,
});
exports.databaseConfig = databaseConfig;
//# sourceMappingURL=database.config.js.map