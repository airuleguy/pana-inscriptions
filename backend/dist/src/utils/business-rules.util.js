"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateCategory = calculateCategory;
exports.determineChoreographyType = determineChoreographyType;
exports.generateChoreographyName = generateChoreographyName;
exports.calculateAge = calculateAge;
exports.isValidGymnastCount = isValidGymnastCount;
const choreography_entity_1 = require("../entities/choreography.entity");
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
function determineChoreographyType(gymnastCount) {
    switch (gymnastCount) {
        case 1:
            return choreography_entity_1.ChoreographyType.INDIVIDUAL;
        case 2:
            return choreography_entity_1.ChoreographyType.MIXED_PAIR;
        case 3:
            return choreography_entity_1.ChoreographyType.TRIO;
        case 5:
            return choreography_entity_1.ChoreographyType.GROUP;
        case 8:
            return choreography_entity_1.ChoreographyType.PLATFORM;
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
//# sourceMappingURL=business-rules.util.js.map