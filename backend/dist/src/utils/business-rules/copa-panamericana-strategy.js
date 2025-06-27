"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CopaPanamericanaStrategy = void 0;
const common_1 = require("@nestjs/common");
const tournament_entity_1 = require("../../entities/tournament.entity");
class CopaPanamericanaStrategy {
    getTournamentType() {
        return tournament_entity_1.TournamentType.COPA_PANAMERICANA;
    }
    async validateChoreographyCreation(request, existingChoreographiesCount) {
        const maxAllowed = this.getMaxChoreographiesPerCountryPerCategory();
        if (existingChoreographiesCount >= maxAllowed) {
            throw new common_1.BadRequestException(`Copa Panamericana allows maximum ${maxAllowed} choreographies per country per category. ${request.country} already has ${existingChoreographiesCount} in ${request.category} category.`);
        }
        await this.validateTournamentSpecificRules(request);
    }
    getMaxChoreographiesPerCountryPerCategory() {
        return 4;
    }
    getAdditionalValidationRules() {
        return [
            'Maximum 4 choreographies per country per category',
            'More flexible country eligibility',
            'Standard licensing requirements',
            'Open to development countries'
        ];
    }
    async validateTournamentSpecificRules(request) {
        if (request.gymnastFigIds.length === 0) {
            throw new common_1.BadRequestException('At least one gymnast is required for Copa Panamericana');
        }
        const eligibleCountries = this.getEligibleCountries();
        if (!eligibleCountries.includes(request.country.toUpperCase())) {
            throw new common_1.BadRequestException(`Country ${request.country} is not eligible for Copa Panamericana. Eligible countries: ${eligibleCountries.join(', ')}`);
        }
    }
    getEligibleCountries() {
        return [
            'ARG', 'BOL', 'BRA', 'CAN', 'CHI', 'COL', 'CRC', 'CUB', 'DOM', 'ECU',
            'ESA', 'GUA', 'HAI', 'HON', 'JAM', 'MEX', 'NCA', 'PAN', 'PAR', 'PER',
            'PUR', 'TTO', 'URU', 'USA', 'VEN',
            'ESP', 'POR', 'ITA', 'FRA', 'GER', 'GBR', 'JPN', 'KOR', 'CHN', 'AUS'
        ];
    }
}
exports.CopaPanamericanaStrategy = CopaPanamericanaStrategy;
//# sourceMappingURL=copa-panamericana-strategy.js.map