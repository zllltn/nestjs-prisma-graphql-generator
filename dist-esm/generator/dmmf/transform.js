import pluralize from 'pluralize';
import { InputOmitSetting, supportedMutationActions, supportedQueryActions } from '../config';
import { camelCase, cleanDocsString, getFieldTSType, getInputTypeName, getModelNameFromInputType, getModelNameFromOutputType, getTypeGraphQLType, pascalCase, } from '../helpers';
import { parseDocumentationAttributes } from './helpers';
import { DMMF } from './types';
export function transformSchema(datamodel, dmmfDocument) {
    var _a, _b, _c, _d;
    const inputObjectTypes = [
        ...((_a = datamodel.inputObjectTypes.prisma) !== null && _a !== void 0 ? _a : []),
        ...((_b = datamodel.inputObjectTypes.model) !== null && _b !== void 0 ? _b : []),
    ];
    const outputObjectTypes = [
        ...((_c = datamodel.outputObjectTypes.prisma) !== null && _c !== void 0 ? _c : []),
        ...((_d = datamodel.outputObjectTypes.model) !== null && _d !== void 0 ? _d : []),
    ];
    return {
        inputTypes: inputObjectTypes
            .filter(uncheckedScalarInputsFilter(dmmfDocument))
            .map(transformInputType(dmmfDocument)),
        outputTypes: outputObjectTypes.map(transformOutputType(dmmfDocument)),
        rootMutationType: datamodel.rootMutationType,
        rootQueryType: datamodel.rootQueryType,
    };
}
export function transformMappings(mapping, dmmfDocument, options) {
    return mapping.map(transformMapping(dmmfDocument, options));
}
export function transformBareModel(model) {
    var _a;
    const attributeArgs = parseDocumentationAttributes(model.documentation, 'type', 'model');
    return {
        ...model,
        typeName: (_a = attributeArgs.name) !== null && _a !== void 0 ? _a : pascalCase(model.name),
        fields: [],
        docs: cleanDocsString(model.documentation),
    };
}
export function transformModelWithFields(dmmfDocument) {
    return (model) => {
        return {
            ...transformBareModel(model),
            fields: model.fields.map(transformModelField(dmmfDocument)),
        };
    };
}
function transformModelField(dmmfDocument) {
    return (field) => {
        const attributeArgs = parseDocumentationAttributes(field.documentation, 'field', 'field');
        const location = field.kind === 'enum'
            ? 'enumTypes'
            : field.kind === 'object'
                ? 'outputObjectTypes'
                : 'scalar';
        if (typeof field.type !== 'string') {
            throw new Error(`[Internal Generator Error] Unexpected 'field.type' value: "${field.type}"`);
        }
        const typeInfo = {
            location,
            isList: field.isList,
            type: dmmfDocument.isModelName(field.type)
                ? dmmfDocument.getModelTypeName(field.type)
                : field.type,
        };
        const fieldTSType = getFieldTSType(dmmfDocument, typeInfo, field.isRequired, false);
        const typeGraphQLType = getTypeGraphQLType(typeInfo, dmmfDocument, undefined, undefined, field.isId);
        const { output = false, input = false } = parseDocumentationAttributes(field.documentation, 'omit', 'field');
        return {
            ...field,
            type: field.type,
            location,
            typeFieldAlias: attributeArgs.name,
            fieldTSType,
            typeGraphQLType,
            docs: cleanDocsString(field.documentation),
            isOmitted: { output, input },
        };
    };
}
function uncheckedScalarInputsFilter(dmmfDocument) {
    const { useUncheckedScalarInputs } = dmmfDocument.options;
    return (inputType) => {
        return useUncheckedScalarInputs ? true : !inputType.name.includes('Unchecked');
    };
}
function transformInputType(dmmfDocument) {
    return (inputType) => {
        const modelName = getModelNameFromInputType(inputType.name);
        const modelType = modelName
            ? dmmfDocument.datamodel.models.find((it) => it.name === modelName)
            : undefined;
        return {
            ...inputType,
            typeName: getInputTypeName(inputType.name, dmmfDocument),
            fields: inputType.fields
                .filter((field) => field.deprecation === undefined)
                .map((field) => {
                var _a;
                const modelField = modelType === null || modelType === void 0 ? void 0 : modelType.fields.find((it) => it.name === field.name);
                const typeName = (_a = modelField === null || modelField === void 0 ? void 0 : modelField.typeFieldAlias) !== null && _a !== void 0 ? _a : field.name;
                const selectedInputType = selectInputTypeFromTypes(dmmfDocument)(field.inputTypes);
                const typeGraphQLType = getTypeGraphQLType(selectedInputType, dmmfDocument);
                const fieldTSType = getFieldTSType(dmmfDocument, selectedInputType, field.isRequired, true);
                const isOmitted = !(modelField === null || modelField === void 0 ? void 0 : modelField.isOmitted.input)
                    ? false
                    : typeof modelField.isOmitted.input === 'boolean'
                        ? modelField.isOmitted.input
                        : (modelField.isOmitted.input.includes(InputOmitSetting.Create) &&
                            inputType.name.includes('Create')) ||
                            (modelField.isOmitted.input.includes(InputOmitSetting.Update) &&
                                inputType.name.includes('Update')) ||
                            (modelField.isOmitted.input.includes(InputOmitSetting.Where) &&
                                inputType.name.includes('Where')) ||
                            (modelField.isOmitted.input.includes(InputOmitSetting.OrderBy) &&
                                inputType.name.includes('OrderBy'));
                return {
                    ...field,
                    selectedInputType,
                    typeName,
                    typeGraphQLType,
                    fieldTSType,
                    hasMappedName: field.name !== typeName,
                    isOmitted,
                };
            }),
            modelName,
            modelType,
        };
    };
}
function transformOutputType(dmmfDocument) {
    return (outputType) => {
        const modelName = dmmfDocument.datamodel.models.find((it) => it.name === getModelNameFromOutputType(outputType.name))
            ? getModelNameFromOutputType(outputType.name)
            : undefined;
        const typeName = getMappedOutputTypeName(dmmfDocument, outputType.name);
        return {
            ...outputType,
            typeName,
            fields: outputType.fields
                .filter((field) => field.deprecation === undefined)
                .map((field) => {
                const isFieldRequired = field.isNullable !== true && field.name !== '_count';
                const outputTypeInfo = {
                    ...field.outputType,
                    type: getMappedOutputTypeName(dmmfDocument, field.outputType.type),
                };
                const fieldTSType = getFieldTSType(dmmfDocument, outputTypeInfo, isFieldRequired, false);
                const typeGraphQLType = getTypeGraphQLType(outputTypeInfo, dmmfDocument);
                const args = field.args.map((arg) => {
                    const selectedInputType = selectInputTypeFromTypes(dmmfDocument)(arg.inputTypes);
                    const typeGraphQLType = getTypeGraphQLType(selectedInputType, dmmfDocument);
                    const fieldTSType = getFieldTSType(dmmfDocument, selectedInputType, arg.isRequired, true);
                    return {
                        ...arg,
                        selectedInputType,
                        fieldTSType,
                        typeGraphQLType,
                        hasMappedName: arg.name !== typeName,
                        typeName: arg.name,
                        isOmitted: false,
                    };
                });
                const argsTypeName = args.length > 0 ? `${typeName}${pascalCase(field.name)}Args` : undefined;
                return {
                    ...field,
                    isRequired: isFieldRequired,
                    outputType: outputTypeInfo,
                    fieldTSType,
                    typeGraphQLType,
                    args,
                    argsTypeName,
                };
            }),
            modelName,
        };
    };
}
export function getMappedOutputTypeName(dmmfDocument, outputTypeName) {
    if (outputTypeName.startsWith('Aggregate')) {
        const modelTypeName = dmmfDocument.getModelTypeName(outputTypeName.replace('Aggregate', ''));
        return `Aggregate${modelTypeName}`;
    }
    if (dmmfDocument.isModelName(outputTypeName)) {
        return dmmfDocument.getModelTypeName(outputTypeName);
    }
    const dedicatedTypeSuffix = [
        'CountAggregateOutputType',
        'MinAggregateOutputType',
        'MaxAggregateOutputType',
        'AvgAggregateOutputType',
        'SumAggregateOutputType',
        'GroupByOutputType',
        'CountOutputType',
    ].find((type) => outputTypeName.includes(type));
    if (dedicatedTypeSuffix) {
        const modelName = outputTypeName.replace(dedicatedTypeSuffix, '');
        const operationName = outputTypeName.replace(modelName, '').replace('OutputType', '');
        return `${dmmfDocument.getModelTypeName(modelName)}${operationName}`;
    }
    return outputTypeName;
}
function transformMapping(dmmfDocument, options) {
    return (mapping) => {
        var _a;
        const { model, plural, ...availableActions } = mapping;
        const modelTypeName = (_a = dmmfDocument.getModelTypeName(model)) !== null && _a !== void 0 ? _a : model;
        const actions = Object.entries(availableActions)
            .sort(([a], [b]) => a.localeCompare(b))
            .filter(([actionKind, fieldName]) => fieldName && getOperationKindName(actionKind))
            .map(([modelAction, fieldName]) => {
            const kind = modelAction;
            const actionOutputType = dmmfDocument.schema.outputTypes.find((type) => type.fields.some((field) => field.name === fieldName));
            if (!actionOutputType) {
                throw new Error(`Cannot find type with field ${fieldName} in root types definitions!`);
            }
            const method = actionOutputType.fields.find((field) => field.name === fieldName);
            const argsTypeName = method.args.length > 0
                ? `${pascalCase(`${kind}${dmmfDocument.getModelTypeName(mapping.model)}`)}Args`
                : undefined;
            const outputTypeName = method.outputType.type;
            const actionResolverName = `${pascalCase(kind)}${modelTypeName}Resolver`;
            const returnTSType = getFieldTSType(dmmfDocument, method.outputType, method.isRequired, false, mapping.model, modelTypeName);
            const typeGraphQLType = getTypeGraphQLType(method.outputType, dmmfDocument, mapping.model, modelTypeName);
            return {
                name: getMappedActionName(kind, modelTypeName, options),
                fieldName: fieldName,
                kind: kind,
                operation: getOperationKindName(kind),
                prismaMethod: getPrismaMethodName(kind),
                method,
                argsTypeName,
                outputTypeName,
                actionResolverName,
                returnTSType,
                typeGraphQLType,
            };
        });
        const resolverName = `${modelTypeName}CrudResolver`;
        return {
            model,
            modelTypeName,
            actions,
            collectionName: camelCase(mapping.model),
            resolverName,
        };
    };
}
function selectInputTypeFromTypes(dmmfDocument) {
    return (inputTypes) => {
        const { useUncheckedScalarInputs } = dmmfDocument.options;
        let possibleInputTypes;
        possibleInputTypes = inputTypes.filter((it) => it.location === 'inputObjectTypes');
        if (possibleInputTypes.length === 0) {
            possibleInputTypes = inputTypes.filter((it) => it.location === 'scalar' && it.type !== 'Null');
        }
        if (possibleInputTypes.length === 0) {
            possibleInputTypes = inputTypes.filter((it) => it.location === 'enumTypes');
        }
        if (possibleInputTypes.length === 0) {
            possibleInputTypes = inputTypes;
        }
        const selectedInputType = possibleInputTypes.find((it) => it.isList) ||
            (useUncheckedScalarInputs &&
                possibleInputTypes.find((it) => it.type.includes('Unchecked'))) ||
            possibleInputTypes[0];
        let inputType = selectedInputType.type;
        if (selectedInputType.location === 'enumTypes') {
            const enumDef = dmmfDocument.enums.find((it) => it.name === inputType);
            inputType = enumDef.typeName;
        }
        else if (selectedInputType.location === 'inputObjectTypes') {
            inputType = getInputTypeName(inputType, dmmfDocument);
        }
        return {
            ...selectedInputType,
            type: inputType,
        };
    };
}
function getMappedActionName(actionName, typeName, options) {
    const defaultMappedActionName = `${actionName}${typeName}`;
    if (options.useOriginalMapping) {
        return defaultMappedActionName;
    }
    const hasNoPlural = typeName === pluralize(typeName);
    if (hasNoPlural) {
        return defaultMappedActionName;
    }
    switch (actionName) {
        case 'findUnique': {
            return camelCase(typeName);
        }
        case 'findMany': {
            return pluralize(camelCase(typeName));
        }
        default: {
            return defaultMappedActionName;
        }
    }
}
function getOperationKindName(actionName) {
    if (supportedQueryActions.includes(actionName)) {
        return 'Query';
    }
    if (supportedMutationActions.includes(actionName)) {
        return 'Mutation';
    }
}
function getPrismaMethodName(actionKind) {
    switch (actionKind) {
        case DMMF.ModelAction.createOne:
            return 'create';
        case DMMF.ModelAction.updateOne:
            return 'update';
        case DMMF.ModelAction.upsertOne:
            return 'upsert';
        case DMMF.ModelAction.deleteOne:
            return 'delete';
        default:
            return actionKind;
    }
}
const ENUM_SUFFIXES = ['OrderByRelevanceFieldEnum', 'ScalarFieldEnum'];
export function transformEnums(dmmfDocument) {
    return (enumDef) => {
        let modelName = undefined;
        let typeName = enumDef.name;
        const detectedSuffix = ENUM_SUFFIXES.find((suffix) => enumDef.name.endsWith(suffix));
        if (detectedSuffix) {
            modelName = enumDef.name.replace(detectedSuffix, '');
            typeName = `${dmmfDocument.getModelTypeName(modelName)}${detectedSuffix}`;
        }
        let enumValues = [];
        if ('values' in enumDef && Array.isArray(enumDef.values)) {
            enumValues = enumDef.values;
        }
        return {
            ...enumDef,
            docs: 'documentation' in enumDef ? cleanDocsString(enumDef.documentation) : undefined,
            typeName,
            valuesMap: enumValues.map((enumValue) => {
                const enumValueName = typeof enumValue === 'string' ? enumValue : enumValue.name;
                return {
                    value: enumValueName,
                    name: (modelName && dmmfDocument.getModelFieldAlias(modelName, enumValueName)) ||
                        enumValueName,
                };
            }),
        };
    };
}
export function generateRelationModel(dmmfDocument) {
    return (model) => {
        const outputType = dmmfDocument.schema.outputTypes.find((type) => type.name === model.name);
        const resolverName = `${model.typeName}RelationsResolver`;
        const relationFields = model.fields
            .filter((field) => field.relationName &&
            !field.isOmitted.output &&
            outputType.fields.some((it) => it.name === field.name))
            .map((field) => {
            const outputTypeField = outputType.fields.find((it) => it.name === field.name);
            const argsTypeName = outputTypeField.args.length > 0
                ? `${model.typeName}${pascalCase(field.name)}Args`
                : undefined;
            return {
                ...field,
                outputTypeField,
                argsTypeName,
                type: dmmfDocument.getModelTypeName(field.type),
            };
        });
        return {
            model,
            outputType,
            relationFields,
            resolverName,
        };
    };
}
//# sourceMappingURL=transform.js.map