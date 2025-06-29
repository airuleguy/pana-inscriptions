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
exports.TokenValidationResponseDto = exports.ValidateTokenDto = exports.JwtPayload = exports.LogoutDto = exports.LoginResponseDto = exports.LoginDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const user_entity_1 = require("../entities/user.entity");
class LoginDto {
}
exports.LoginDto = LoginDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Username for authentication',
        example: 'usa_delegate'
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], LoginDto.prototype, "username", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Password for authentication',
        example: 'securePassword123'
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], LoginDto.prototype, "password", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Client IP address',
        example: '192.168.1.100',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LoginDto.prototype, "ipAddress", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'User agent string',
        example: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LoginDto.prototype, "userAgent", void 0);
class LoginResponseDto {
}
exports.LoginResponseDto = LoginResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'JWT access token',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
    }),
    __metadata("design:type", String)
], LoginResponseDto.prototype, "accessToken", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Token type',
        example: 'Bearer'
    }),
    __metadata("design:type", String)
], LoginResponseDto.prototype, "tokenType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Token expiration time in seconds',
        example: 2592000
    }),
    __metadata("design:type", Number)
], LoginResponseDto.prototype, "expiresIn", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'User information'
    }),
    __metadata("design:type", Object)
], LoginResponseDto.prototype, "user", void 0);
class LogoutDto {
}
exports.LogoutDto = LogoutDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'JWT token to revoke',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], LogoutDto.prototype, "token", void 0);
class JwtPayload {
}
exports.JwtPayload = JwtPayload;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'User ID' }),
    __metadata("design:type", String)
], JwtPayload.prototype, "sub", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Username' }),
    __metadata("design:type", String)
], JwtPayload.prototype, "username", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Country code' }),
    __metadata("design:type", String)
], JwtPayload.prototype, "country", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'User role' }),
    __metadata("design:type", String)
], JwtPayload.prototype, "role", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'JWT ID for session tracking' }),
    __metadata("design:type", String)
], JwtPayload.prototype, "jti", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Issued at timestamp' }),
    __metadata("design:type", Number)
], JwtPayload.prototype, "iat", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Expiration timestamp' }),
    __metadata("design:type", Number)
], JwtPayload.prototype, "exp", void 0);
class ValidateTokenDto {
}
exports.ValidateTokenDto = ValidateTokenDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'JWT token to validate',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ValidateTokenDto.prototype, "token", void 0);
class TokenValidationResponseDto {
}
exports.TokenValidationResponseDto = TokenValidationResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Whether the token is valid' }),
    __metadata("design:type", Boolean)
], TokenValidationResponseDto.prototype, "isValid", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'User information if token is valid', required: false }),
    __metadata("design:type", Object)
], TokenValidationResponseDto.prototype, "user", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Error message if token is invalid', required: false }),
    __metadata("design:type", String)
], TokenValidationResponseDto.prototype, "error", void 0);
//# sourceMappingURL=auth.dto.js.map