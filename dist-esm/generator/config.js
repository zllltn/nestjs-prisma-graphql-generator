export const supportedQueryActions = ['findUnique', 'findFirst', 'findMany', 'aggregate', 'groupBy'];
export const supportedMutationActions = ['createOne', 'createMany', 'deleteOne', 'updateOne', 'deleteMany', 'updateMany', 'upsertOne'];
export var InputOmitSetting;
(function (InputOmitSetting) {
    InputOmitSetting["Create"] = "create";
    InputOmitSetting["Update"] = "update";
    InputOmitSetting["Where"] = "where";
    InputOmitSetting["OrderBy"] = "orderBy";
})(InputOmitSetting || (InputOmitSetting = {}));
//# sourceMappingURL=config.js.map