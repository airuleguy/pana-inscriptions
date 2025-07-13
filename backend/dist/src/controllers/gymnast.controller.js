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
exports.GymnastController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const gymnast_service_1 = require("../services/gymnast.service");
const gymnast_dto_1 = require("../dto/gymnast.dto");
const create_gymnast_dto_1 = require("../dto/create-gymnast.dto");
const update_gymnast_dto_1 = require("../dto/update-gymnast.dto");
let GymnastController = class GymnastController {
    constructor(gymnastService) {
        this.gymnastService = gymnastService;
    }
    async findAll(country) {
        return this.gymnastService.findAll(country);
    }
    async findOne(figId) {
        return this.gymnastService.findByFigId(figId);
    }
    async clearCache() {
        return this.gymnastService.clearCache();
    }
    async create(createGymnastDto) {
        return this.gymnastService.create(createGymnastDto);
    }
    async update(id, updateGymnastDto) {
        return this.gymnastService.update(id, updateGymnastDto);
    }
    async remove(id) {
        return this.gymnastService.remove(id);
    }
};
exports.GymnastController = GymnastController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Get all licensed gymnasts',
        description: 'Retrieve all aerobic gymnasts from FIG database with optional country filter'
    }),
    (0, swagger_1.ApiQuery)({
        name: 'country',
        required: false,
        description: 'Filter by country code (ISO 3166-1 alpha-3)',
        example: 'USA'
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'List of licensed gymnasts',
        type: [gymnast_dto_1.GymnastDto]
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.BAD_GATEWAY,
        description: 'FIG API unavailable'
    }),
    __param(0, (0, common_1.Query)('country')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], GymnastController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':figId'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get gymnast by FIG ID',
        description: 'Retrieve a specific gymnast by their FIG ID'
    }),
    (0, swagger_1.ApiParam)({ name: 'figId', description: 'FIG ID of the gymnast', example: 'FIG123456' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Gymnast details',
        type: gymnast_dto_1.GymnastDto
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.NOT_FOUND,
        description: 'Gymnast not found'
    }),
    __param(0, (0, common_1.Param)('figId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], GymnastController.prototype, "findOne", null);
__decorate([
    (0, common_1.Delete)('cache'),
    (0, swagger_1.ApiOperation)({
        summary: 'Clear gymnast cache',
        description: 'Clear the cached FIG gymnast data to force fresh API call'
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.NO_CONTENT,
        description: 'Cache cleared successfully'
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], GymnastController.prototype, "clearCache", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Create a new local gymnast',
        description: 'Create a new gymnast locally for athletes not registered in FIG database'
    }),
    (0, swagger_1.ApiBody)({ type: create_gymnast_dto_1.CreateGymnastDto }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.CREATED,
        description: 'Gymnast successfully created',
        type: gymnast_dto_1.GymnastDto
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.BAD_REQUEST,
        description: 'Invalid input data or FIG ID already exists'
    }),
    __param(0, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_gymnast_dto_1.CreateGymnastDto]),
    __metadata("design:returntype", Promise)
], GymnastController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Update a local gymnast',
        description: 'Update an existing local gymnast (FIG API gymnasts cannot be updated)'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Database ID of the gymnast', example: 'uuid-string' }),
    (0, swagger_1.ApiBody)({ type: update_gymnast_dto_1.UpdateGymnastDto }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Gymnast successfully updated',
        type: gymnast_dto_1.GymnastDto
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.NOT_FOUND,
        description: 'Gymnast not found'
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.BAD_REQUEST,
        description: 'Cannot update FIG API gymnasts'
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_gymnast_dto_1.UpdateGymnastDto]),
    __metadata("design:returntype", Promise)
], GymnastController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Delete a local gymnast',
        description: 'Delete a local gymnast (FIG API gymnasts cannot be deleted)'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Database ID of the gymnast', example: 'uuid-string' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.NO_CONTENT,
        description: 'Gymnast successfully deleted'
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.NOT_FOUND,
        description: 'Gymnast not found'
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.BAD_REQUEST,
        description: 'Cannot delete FIG API gymnasts'
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], GymnastController.prototype, "remove", null);
exports.GymnastController = GymnastController = __decorate([
    (0, swagger_1.ApiTags)('gymnasts'),
    (0, common_1.Controller)('gymnasts'),
    __metadata("design:paramtypes", [gymnast_service_1.GymnastService])
], GymnastController);
//# sourceMappingURL=gymnast.controller.js.map