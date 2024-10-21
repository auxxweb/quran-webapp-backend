"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleValidationErrors = handleValidationErrors;
function handleValidationErrors(res, errorMessages) {
    return __awaiter(this, void 0, void 0, function* () {
        const simplifiedErrors = {};
        errorMessages.forEach((error) => {
            const property = error.property;
            const constraint = error.constraints
                ? Object.values(error.constraints)[0]
                : "Unknown error";
            simplifiedErrors[property] = constraint;
        });
        return simplifiedErrors;
    });
}
