"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateChoreographyDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_choreography_dto_1 = require("./create-choreography.dto");
class UpdateChoreographyDto extends (0, swagger_1.PartialType)(create_choreography_dto_1.CreateChoreographyDto) {
}
exports.UpdateChoreographyDto = UpdateChoreographyDto;
//# sourceMappingURL=update-choreography.dto.js.map