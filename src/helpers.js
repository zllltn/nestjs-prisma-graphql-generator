"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseStringBoolean = parseStringBoolean;
exports.parseStringArray = parseStringArray;
function parseStringBoolean(stringBoolean) {
    return stringBoolean ? stringBoolean === 'true' : undefined;
}
function parseStringArray(stringArray, optionPropertyName, allowedValues) {
    if (!stringArray) {
        return undefined;
    }
    const parsedArray = (Array.isArray(stringArray) ? stringArray : stringArray.split(',')).map((it) => it.trim());
    if (allowedValues) {
        for (const option of parsedArray) {
            if (!allowedValues.includes(option)) {
                throw new Error(`Invalid "${optionPropertyName}" option value "${option}" provided for NestJsGraphQL generator.`);
            }
        }
    }
    return parsedArray;
}
//# sourceMappingURL=helpers.js.map