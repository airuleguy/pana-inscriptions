"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegistrationStatusDescriptions = exports.RegistrationStatus = void 0;
var RegistrationStatus;
(function (RegistrationStatus) {
    RegistrationStatus["PENDING"] = "PENDING";
    RegistrationStatus["SUBMITTED"] = "SUBMITTED";
    RegistrationStatus["REGISTERED"] = "REGISTERED";
})(RegistrationStatus || (exports.RegistrationStatus = RegistrationStatus = {}));
exports.RegistrationStatusDescriptions = {
    [RegistrationStatus.PENDING]: 'Registration created but not yet submitted',
    [RegistrationStatus.SUBMITTED]: 'Registration submitted for review',
    [RegistrationStatus.REGISTERED]: 'Registration approved and confirmed'
};
//# sourceMappingURL=registration-status.js.map