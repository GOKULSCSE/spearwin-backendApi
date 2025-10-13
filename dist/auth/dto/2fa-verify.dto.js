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
exports.Verify2FaDto = void 0;
const class_validator_1 = require("class-validator");
class Verify2FaDto {
    code;
    userId;
}
exports.Verify2FaDto = Verify2FaDto;
__decorate([
    (0, class_validator_1.IsString)({ message: '2FA code must be a string' }),
    (0, class_validator_1.IsNotEmpty)({ message: '2FA code is required' }),
    __metadata("design:type", String)
], Verify2FaDto.prototype, "code", void 0);
__decorate([
    (0, class_validator_1.IsUUID)('4', { message: 'User ID must be a valid UUID' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'User ID is required' }),
    __metadata("design:type", String)
], Verify2FaDto.prototype, "userId", void 0);
//# sourceMappingURL=2fa-verify.dto.js.map