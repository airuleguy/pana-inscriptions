"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserSession = void 0;
const typeorm_1 = require("typeorm");
const swagger_1 = require("@nestjs/swagger");
const user_entity_1 = require("./user.entity");
let UserSession = class UserSession {
};
exports.UserSession = UserSession;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Unique session ID' }),
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], UserSession.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'User who owns this session' }),
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, user => user.sessions, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], UserSession.prototype, "user", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'JWT token identifier (jti claim)', example: 'abc123-def456-ghi789' }),
    (0, typeorm_1.Column)({ name: 'jwt_id', unique: true }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], UserSession.prototype, "jwtId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Session expiration timestamp' }),
    (0, typeorm_1.Column)({ name: 'expires_at', type: 'timestamp' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", Date)
], UserSession.prototype, "expiresAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Whether the session has been revoked', example: false }),
    (0, typeorm_1.Column)({ name: 'is_revoked', default: false }),
    __metadata("design:type", Boolean)
], UserSession.prototype, "isRevoked", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'IP address from which the session was created' }),
    (0, typeorm_1.Column)({ name: 'ip_address', nullable: true }),
    __metadata("design:type", String)
], UserSession.prototype, "ipAddress", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'User agent string from the client' }),
    (0, typeorm_1.Column)({ name: 'user_agent', type: 'text', nullable: true }),
    __metadata("design:type", String)
], UserSession.prototype, "userAgent", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Session creation date' }),
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], UserSession.prototype, "createdAt", void 0);
exports.UserSession = UserSession = __decorate([
    (0, typeorm_1.Entity)('user_sessions')
], UserSession);
//# sourceMappingURL=user-session.entity.js.map