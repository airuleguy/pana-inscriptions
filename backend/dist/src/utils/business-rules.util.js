"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateCategory = calculateCategory;
exports.getBusinessRulesForTournament = getBusinessRulesForTournament;
exports.determineChoreographyType = determineChoreographyType;
exports.generateChoreographyName = generateChoreographyName;
exports.calculateAge = calculateAge;
exports.isValidGymnastCount = isValidGymnastCount;
exports.getChoreographyTypeDisplayName = getChoreographyTypeDisplayName;
exports.getExpectedGymnastCount = getExpectedGymnastCount;
const choreography_entity_1 = require("../entities/choreography.entity");
const business_rules_factory_1 = require("./business-rules/business-rules-factory");
function calculateCategory(oldestAge) {
    if (oldestAge <= 15) {
        return choreography_entity_1.ChoreographyCategory.YOUTH;
    }
    else if (oldestAge <= 17) {
        return choreography_entity_1.ChoreographyCategory.JUNIOR;
    }
    else {
        return choreography_entity_1.ChoreographyCategory.SENIOR;
    }
}
function getBusinessRulesForTournament(tournamentType) {
    const factory = new business_rules_factory_1.BusinessRulesFactory();
    return factory.getStrategy(tournamentType);
}
function determineChoreographyType(gymnastCount, gymnasts) {
    switch (gymnastCount) {
        case 1:
            const gymnast = gymnasts[0];
            if (gymnast.gender.toUpperCase() === 'MALE' || gymnast.gender.toUpperCase() === 'M') {
                return choreography_entity_1.ChoreographyType.MIND;
            }
            else {
                return choreography_entity_1.ChoreographyType.WIND;
            }
        case 2:
            return choreography_entity_1.ChoreographyType.MXP;
        case 3:
            return choreography_entity_1.ChoreographyType.TRIO;
        case 5:
            return choreography_entity_1.ChoreographyType.GRP;
        case 8:
            return choreography_entity_1.ChoreographyType.DNCE;
        default:
            throw new Error(`Invalid gymnast count: ${gymnastCount}. Must be 1, 2, 3, 5, or 8.`);
    }
}
function generateChoreographyName(surnames) {
    return surnames
        .map(surname => surname.toUpperCase().trim())
        .join('-');
}
function calculateAge(birthDate) {
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    return age;
}
function isValidGymnastCount(count) {
    return [1, 2, 3, 5, 8].includes(count);
}
function getChoreographyTypeDisplayName(type) {
    switch (type) {
        case choreography_entity_1.ChoreographyType.MIND:
            return "Men's Individual";
        case choreography_entity_1.ChoreographyType.WIND:
            return "Women's Individual";
        case choreography_entity_1.ChoreographyType.MXP:
            return "Mixed Pair";
        case choreography_entity_1.ChoreographyType.TRIO:
            return "Trio 3";
        case choreography_entity_1.ChoreographyType.GRP:
            return "Group 5";
        case choreography_entity_1.ChoreographyType.DNCE:
            return "Dance 8";
        default:
            return type;
    }
}
function getExpectedGymnastCount(type) {
    switch (type) {
        case choreography_entity_1.ChoreographyType.MIND:
        case choreography_entity_1.ChoreographyType.WIND:
            return 1;
        case choreography_entity_1.ChoreographyType.MXP:
            return 2;
        case choreography_entity_1.ChoreographyType.TRIO:
            return 3;
        case choreography_entity_1.ChoreographyType.GRP:
            return 5;
        case choreography_entity_1.ChoreographyType.DNCE:
            return 8;
        default:
            throw new Error(`Unknown choreography type: ${type}`);
    }
}
//# sourceMappingURL=business-rules.util.js.map