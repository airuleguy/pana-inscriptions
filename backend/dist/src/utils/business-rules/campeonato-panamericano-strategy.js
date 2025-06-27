"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CampeonatoPanamericanoStrategy = void 0;
const common_1 = require("@nestjs/common");
const tournament_entity_1 = require("../../entities/tournament.entity");
class CampeonatoPanamericanoStrategy {
    getTournamentType() {
        return tournament_entity_1.TournamentType.CAMPEONATO_PANAMERICANO;
    }
    async validateChoreographyCreation(request, existingChoreographiesCount) {
        const maxAllowed = this.getMaxChoreographiesPerCountryPerCategory();
        if (existingChoreographiesCount >= maxAllowed) {
            throw new common_1.BadRequestException(`Campeonato Panamericano allows maximum ${maxAllowed} choreographies per country per category. ${request.country} already has ${existingChoreographiesCount} in ${request.category} category.`);
        }
        await this.validateTournamentSpecificRules(request);
    }
    getMaxChoreographiesPerCountryPerCategory() {
        return 2;
    }
    getAdditionalValidationRules() {
        return [
            'Maximum 2 choreographies per country per category',
            'All gymnasts must be from the same country',
            'Stricter age verification requirements',
            'Enhanced licensing validation'
        ];
    }
    async validateTournamentSpecificRules(request) {
        if (request.gymnastFigIds.length === 0) {
            throw new common_1.BadRequestException('At least one gymnast is required for Campeonato Panamericano');
        }
        const eligibleCountries = this.getEligibleCountries();
        if (!eligibleCountries.includes(request.country.toUpperCase())) {
            throw new common_1.BadRequestException(`Country ${request.country} is not eligible for Campeonato Panamericano. Eligible countries: ${eligibleCountries.join(', ')}`);
        }
    }
    getEligibleCountries() {
        return [
            'ARG', 'BOL', 'BRA', 'CAN', 'CHI', 'COL', 'CRC', 'CUB', 'DOM', 'ECU',
            'ESA', 'GUA', 'HAI', 'HON', 'JAM', 'MEX', 'NCA', 'PAN', 'PAR', 'PER',
            'PUR', 'TTO', 'URU', 'USA', 'VEN'
        ];
    }
}
exports.CampeonatoPanamericanoStrategy = CampeonatoPanamericanoStrategy;
//# sourceMappingURL=campeonato-panamericano-strategy.js.map