"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateModel = void 0;
const path_1 = __importDefault(require("path"));
const helpers_1 = require("./helpers");
const generateModel = (dmmfDocument, project, outputDir, model) => {
    const modelName = (0, helpers_1.camelCase)(model.name);
    const writeLocation = path_1.default.join(outputDir, 'models', `${modelName}.model.ts`);
    const sourceFile = project.createSourceFile(writeLocation, undefined, {
        overwrite: true,
    });
    const modelOutputType = dmmfDocument.schema.outputTypes.find((type) => type.name === model.name);
    sourceFile.addImportDeclaration({ moduleSpecifier: '@nestjs/graphql', namespaceImport: 'NestJsGraphQL' });
    const enums = model.fields.filter((field) => field.location === 'enumTypes').map((field) => field.type);
    for (const item of [...new Set(enums)].sort()) {
        sourceFile.addImportDeclaration({
            moduleSpecifier: path_1.default.posix.join('../enums', `${item}.enum`),
            namedImports: enums,
        });
    }
    const models = model.fields
        .filter((field) => field.location === 'outputObjectTypes')
        .filter((field) => field.type !== model.name)
        .map((field) => (dmmfDocument.isModelName(field.type) ? dmmfDocument.getModelTypeName(field.type) : field.type));
    for (const item of [...new Set(models)].sort()) {
        sourceFile.addImportDeclaration({
            moduleSpecifier: path_1.default.posix.join('../models', `${(0, helpers_1.camelCase)(item)}.model`),
            namedImports: [item],
        });
    }
    const countField = modelOutputType.fields.find((it) => it.name === '_count');
    const shouldEmitCountField = countField !== undefined && dmmfDocument.shouldGenerateBlock('crudResolvers');
    if (shouldEmitCountField) {
        for (const elementName of [...new Set([countField.typeGraphQLType])].sort()) {
            sourceFile.addImportDeclaration({
                moduleSpecifier: path_1.default.posix.join('..', modelName, 'outputs', `${elementName}.output`),
                namedImports: [elementName],
            });
        }
    }
    sourceFile.addClass({
        name: model.typeName,
        isExported: true,
        decorators: [
            {
                name: 'NestJsGraphQL.ObjectType',
                arguments: [`'${model.typeName}'`, ...(0, helpers_1.getArguments)(undefined, model.docs, undefined, true, dmmfDocument.options.simpleResolvers)],
            },
        ],
        properties: [
            ...model.fields.map((field) => {
                const isOptional = !!field.relationName || field.isOmitted.output || (!field.isRequired && field.typeFieldAlias === undefined);
                return {
                    name: field.name,
                    type: field.fieldTSType,
                    hasExclamationToken: !isOptional,
                    hasQuestionToken: isOptional,
                    trailingTrivia: '\r\n',
                    decorators: [
                        ...(field.relationName || field.typeFieldAlias || field.isOmitted.output
                            ? []
                            : [{ name: 'NestJsGraphQL.Field', arguments: (0, helpers_1.getArguments)(field.typeGraphQLType, field.docs, isOptional) }]),
                    ],
                    ...(field.docs && {
                        docs: [{ description: `\n${(0, helpers_1.convertNewLines)(field.docs)}` }],
                    }),
                };
            }),
            ...(shouldEmitCountField
                ? [
                    {
                        name: countField.name,
                        type: countField.fieldTSType,
                        hasExclamationToken: countField.isRequired,
                        hasQuestionToken: !countField.isRequired,
                        trailingTrivia: '\r\n',
                        decorators: [{ name: 'NestJsGraphQL.Field', arguments: (0, helpers_1.getArguments)(countField.typeGraphQLType, undefined, true) }],
                    },
                ]
                : []),
        ],
        getAccessors: model.fields
            .filter((field) => field.typeFieldAlias && !field.relationName && !field.isOmitted.output)
            .map((field) => {
            return {
                name: field.typeFieldAlias,
                returnType: field.fieldTSType,
                trailingTrivia: '\r\n',
                decorators: [
                    {
                        name: 'NestJsGraphQL.Field',
                        arguments: (0, helpers_1.getArguments)(field.typeGraphQLType, field.docs, !field.isRequired),
                    },
                ],
                statements: [field.isRequired ? `return this.${field.name};` : `return this.${field.name} ?? null;`],
                ...(field.docs && {
                    docs: [{ description: `\n${(0, helpers_1.convertNewLines)(field.docs)}` }],
                }),
            };
        }),
        ...(model.docs && {
            docs: [{ description: `\n${(0, helpers_1.convertNewLines)(model.docs)}` }],
        }),
    });
};
exports.generateModel = generateModel;
//# sourceMappingURL=generateModel.js.map