export declare enum ChoreographyCategory {
    YOUTH = "YOUTH",
    JUNIOR = "JUNIOR",
    SENIOR = "SENIOR"
}
export declare enum ChoreographyType {
    MIND = "MIND",
    WIND = "WIND",
    MXP = "MXP",
    TRIO = "TRIO",
    GRP = "GRP",
    DNCE = "DNCE"
}
export declare const AGE_LIMITS: {
    readonly YOUTH: {
        readonly min: 0;
        readonly max: 14;
    };
    readonly JUNIOR: {
        readonly min: 15;
        readonly max: 17;
    };
    readonly SENIOR: {
        readonly min: 18;
        readonly max: 100;
    };
};
export declare const CHOREOGRAPHY_TYPE_INFO: {
    readonly MIND: {
        readonly name: "Men's Individual";
        readonly count: 1;
    };
    readonly WIND: {
        readonly name: "Women's Individual";
        readonly count: 1;
    };
    readonly MXP: {
        readonly name: "Mixed Pair";
        readonly count: 2;
    };
    readonly TRIO: {
        readonly name: "Trio";
        readonly count: 3;
    };
    readonly GRP: {
        readonly name: "Group";
        readonly count: 5;
    };
    readonly DNCE: {
        readonly name: "Dance";
        readonly count: 8;
    };
};
export declare const VALID_CATEGORIES: ChoreographyCategory[];
export declare const VALID_CHOREOGRAPHY_TYPES: ChoreographyType[];
