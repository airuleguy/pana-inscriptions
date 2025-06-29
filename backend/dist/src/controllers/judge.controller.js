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
var JudgeController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.JudgeController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const fig_api_service_1 = require("../services/fig-api.service");
const judge_dto_1 = require("../dto/judge.dto");
let JudgeController = JudgeController_1 = class JudgeController {
    constructor(figApiService) {
        this.figApiService = figApiService;
        this.logger = new common_1.Logger(JudgeController_1.name);
    }
    async findAll(country) {
        if (country) {
            return this.figApiService.getJudgesByCountry(country);
        }
        return this.figApiService.getJudges();
    }
    async findOne(id) {
        return this.figApiService.getJudgeById(id);
    }
    async clearCache() {
        return this.figApiService.clearJudgeCache();
    }
};
exports.JudgeController = JudgeController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Get all certified judges',
        description: 'Retrieve all aerobic gymnastics judges from FIG database with optional country filter'
    }),
    (0, swagger_1.ApiQuery)({
        name: 'country',
        required: false,
        description: 'Filter by country code (ISO 3166-1 alpha-3)',
        example: 'USA'
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'List of certified judges',
        type: [judge_dto_1.JudgeDto]
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.BAD_GATEWAY,
        description: 'FIG API unavailable'
    }),
    __param(0, (0, common_1.Query)('country')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], JudgeController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get judge by FIG ID',
        description: 'Retrieve a specific judge by their FIG ID'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'FIG ID of the judge', example: '3622' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Judge details',
        type: judge_dto_1.JudgeDto
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.NOT_FOUND,
        description: 'Judge not found'
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], JudgeController.prototype, "findOne", null);
__decorate([
    (0, common_1.Delete)('cache'),
    (0, swagger_1.ApiOperation)({
        summary: 'Clear judge cache',
        description: 'Clear the cached FIG judge data to force fresh API call'
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.NO_CONTENT,
        description: 'Cache cleared successfully'
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], JudgeController.prototype, "clearCache", null);
exports.JudgeController = JudgeController = JudgeController_1 = __decorate([
    (0, swagger_1.ApiTags)('judges'),
    (0, common_1.Controller)('api/v1/judges'),
    __metadata("design:paramtypes", [fig_api_service_1.FigApiService])
], JudgeController);
//# sourceMappingURL=judge.controller.js.map