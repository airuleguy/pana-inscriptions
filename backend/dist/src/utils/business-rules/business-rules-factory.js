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
exports.BusinessRulesFactory = void 0;
const common_1 = require("@nestjs/common");
const campeonato_panamericano_strategy_1 = require("./campeonato-panamericano-strategy");
const copa_panamericana_strategy_1 = require("./copa-panamericana-strategy");
let BusinessRulesFactory = class BusinessRulesFactory {
    constructor() {
        this.strategies = new Map();
        this.initializeStrategies();
    }
    initializeStrategies() {
        const campeonatoStrategy = new campeonato_panamericano_strategy_1.CampeonatoPanamericanoStrategy();
        const copaStrategy = new copa_panamericana_strategy_1.CopaPanamericanaStrategy();
        this.strategies.set(campeonatoStrategy.getTournamentType(), campeonatoStrategy);
        this.strategies.set(copaStrategy.getTournamentType(), copaStrategy);
    }
    getStrategy(tournamentType) {
        const strategy = this.strategies.get(tournamentType);
        if (!strategy) {
            throw new Error(`No business rules strategy found for tournament type: ${tournamentType}`);
        }
        return strategy;
    }
    getAllStrategies() {
        return Array.from(this.strategies.values());
    }
    getSupportedTournamentTypes() {
        return Array.from(this.strategies.keys());
    }
};
exports.BusinessRulesFactory = BusinessRulesFactory;
exports.BusinessRulesFactory = BusinessRulesFactory = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], BusinessRulesFactory);
//# sourceMappingURL=business-rules-factory.js.map