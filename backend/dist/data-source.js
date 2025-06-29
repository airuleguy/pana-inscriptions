"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
const typeorm_1 = require("typeorm");
const dotenv_1 = require("dotenv");
const gymnast_entity_1 = require("./src/entities/gymnast.entity");
const choreography_entity_1 = require("./src/entities/choreography.entity");
const tournament_entity_1 = require("./src/entities/tournament.entity");
const coach_entity_1 = require("./src/entities/coach.entity");
const judge_entity_1 = require("./src/entities/judge.entity");
const user_entity_1 = require("./src/entities/user.entity");
const user_session_entity_1 = require("./src/entities/user-session.entity");
(0, dotenv_1.config)();
exports.AppDataSource = new typeorm_1.DataSource({
    type: 'postgres',
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT, 10) || 5432,
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
    entities: [gymnast_entity_1.Gymnast, choreography_entity_1.Choreography, tournament_entity_1.Tournament, coach_entity_1.Coach, judge_entity_1.Judge, user_entity_1.User, user_session_entity_1.UserSession],
    migrations: ['src/migrations/*.ts'],
    migrationsRun: false,
    migrationsTableName: 'migrations',
    synchronize: false,
    logging: true,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});
//# sourceMappingURL=data-source.js.map