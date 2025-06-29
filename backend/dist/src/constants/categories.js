"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VALID_CHOREOGRAPHY_TYPES = exports.VALID_CATEGORIES = exports.CHOREOGRAPHY_TYPE_INFO = exports.AGE_LIMITS = exports.ChoreographyType = exports.ChoreographyCategory = void 0;
var ChoreographyCategory;
(function (ChoreographyCategory) {
    ChoreographyCategory["YOUTH"] = "YOUTH";
    ChoreographyCategory["JUNIOR"] = "JUNIOR";
    ChoreographyCategory["SENIOR"] = "SENIOR";
})(ChoreographyCategory || (exports.ChoreographyCategory = ChoreographyCategory = {}));
var ChoreographyType;
(function (ChoreographyType) {
    ChoreographyType["MIND"] = "MIND";
    ChoreographyType["WIND"] = "WIND";
    ChoreographyType["MXP"] = "MXP";
    ChoreographyType["TRIO"] = "TRIO";
    ChoreographyType["GRP"] = "GRP";
    ChoreographyType["DNCE"] = "DNCE";
})(ChoreographyType || (exports.ChoreographyType = ChoreographyType = {}));
exports.AGE_LIMITS = {
    [ChoreographyCategory.YOUTH]: { min: 0, max: 14 },
    [ChoreographyCategory.JUNIOR]: { min: 15, max: 17 },
    [ChoreographyCategory.SENIOR]: { min: 18, max: 100 }
};
exports.CHOREOGRAPHY_TYPE_INFO = {
    [ChoreographyType.MIND]: { name: "Men's Individual", count: 1 },
    [ChoreographyType.WIND]: { name: "Women's Individual", count: 1 },
    [ChoreographyType.MXP]: { name: "Mixed Pair", count: 2 },
    [ChoreographyType.TRIO]: { name: "Trio", count: 3 },
    [ChoreographyType.GRP]: { name: "Group", count: 5 },
    [ChoreographyType.DNCE]: { name: "Dance", count: 8 }
};
exports.VALID_CATEGORIES = Object.values(ChoreographyCategory);
exports.VALID_CHOREOGRAPHY_TYPES = Object.values(ChoreographyType);
//# sourceMappingURL=categories.js.map