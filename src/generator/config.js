"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InputOmitSetting = exports.supportedMutationActions = exports.supportedQueryActions = void 0;
exports.supportedQueryActions = ['findUnique', 'findFirst', 'findMany', 'aggregate', 'groupBy'];
exports.supportedMutationActions = ['createOne', 'createMany', 'deleteOne', 'updateOne', 'deleteMany', 'updateMany', 'upsertOne'];
var InputOmitSetting;
(function (InputOmitSetting) {
    InputOmitSetting["Create"] = "create";
    InputOmitSetting["Update"] = "update";
    InputOmitSetting["Where"] = "where";
    InputOmitSetting["OrderBy"] = "orderBy";
})(InputOmitSetting || (exports.InputOmitSetting = InputOmitSetting = {}));
//# sourceMappingURL=config.js.map