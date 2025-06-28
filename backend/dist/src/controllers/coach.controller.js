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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoachController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const fig_api_service_1 = require("../services/fig-api.service");
const coach_dto_1 = require("../dto/coach.dto");
let CoachController = class CoachController {
    constructor(figApiService) {
        this.figApiService = figApiService;
    }
    async findAll(country) {
        if (country) {
            return this.figApiService.getCoachesByCountry(country);
        }
        return this.figApiService.getCoaches();
    }
    async findOne(id) {
        return this.figApiService.getCoachById(id);
    }
    async clearCache() {
        return this.figApiService.clearCoachCache();
    }
};
exports.CoachController = CoachController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Get all certified coaches',
        description: 'Retrieve all aerobic gymnastics coaches from FIG database with optional country filter'
    }),
    (0, swagger_1.ApiQuery)({
        name: 'country',
        required: false,
        description: 'Filter by country code (ISO 3166-1 alpha-3)',
        example: 'USA'
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'List of certified coaches',
        type: [coach_dto_1.CoachDto]
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.BAD_GATEWAY,
        description: 'FIG API unavailable'
    }),
    __param(0, (0, common_1.Query)('country')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CoachController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get coach by FIG ID',
        description: 'Retrieve a specific coach by their FIG ID'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'FIG ID of the coach', example: 'COACH123456' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Coach details',
        type: coach_dto_1.CoachDto
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.NOT_FOUND,
        description: 'Coach not found'
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CoachController.prototype, "findOne", null);
__decorate([
    (0, common_1.Delete)('cache'),
    (0, swagger_1.ApiOperation)({
        summary: 'Clear coach cache',
        description: 'Clear the cached FIG coach data to force fresh API call'
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.NO_CONTENT,
        description: 'Cache cleared successfully'
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CoachController.prototype, "clearCache", null);
exports.CoachController = CoachController = __decorate([
    (0, swagger_1.ApiTags)('coaches'),
    (0, common_1.Controller)('api/v1/coaches'),
    __metadata("design:paramtypes", [fig_api_service_1.FigApiService])
], CoachController);
//# sourceMappingURL=coach.controller.js.map