import { transformSchema, transformMappings, transformBareModel, transformModelWithFields, transformEnums, generateRelationModel, } from './transform';
export class DmmfDocument {
    constructor({ datamodel, schema, mappings }, options) {
        var _a, _b;
        this.options = options;
        const enumTypes = [...((_a = schema.enumTypes.prisma) !== null && _a !== void 0 ? _a : []), ...((_b = schema.enumTypes.model) !== null && _b !== void 0 ? _b : [])];
        const models = [...datamodel.models, ...datamodel.types];
        this.models = models.map(transformBareModel);
        this.enums = enumTypes.map(transformEnums(this));
        this.models = models.map(transformModelWithFields(this));
        this.enums = enumTypes.map(transformEnums(this));
        this.datamodel = {
            models: this.models,
            enums: datamodel.enums.map(transformEnums(this)),
            types: [],
        };
        this.schema = {
            ...transformSchema(schema, this),
            enums: this.enums,
        };
        this.modelMappings = transformMappings(mappings.modelOperations, this, options);
        this.relationModels = this.models
            .filter((model) => model.fields.some((field) => field.relationName !== undefined && !field.isOmitted.output))
            .filter((model) => {
            const outputType = this.schema.outputTypes.find((type) => type.name === model.name);
            return (outputType &&
                outputType.fields.some((outputTypeField) => model.fields.some((modelField) => modelField.name === outputTypeField.name &&
                    modelField.relationName !== undefined &&
                    !modelField.isOmitted.output)));
        })
            .map(generateRelationModel(this));
    }
    getModelTypeName(modelName) {
        var _a;
        return (_a = this.models.find((it) => it.name.toLocaleLowerCase() === modelName.toLocaleLowerCase())) === null || _a === void 0 ? void 0 : _a.typeName;
    }
    isModelName(typeName) {
        return this.models.some((it) => it.name === typeName);
    }
    getModelFieldAlias(modelName, fieldName) {
        var _a;
        const model = this.models.find((it) => it.name === modelName);
        return (_a = model === null || model === void 0 ? void 0 : model.fields.find((it) => it.name === fieldName)) === null || _a === void 0 ? void 0 : _a.typeFieldAlias;
    }
    shouldGenerateBlock(block) {
        return this.options.blocksToEmit.includes(block);
    }
}
//# sourceMappingURL=DmmfDocument.js.map