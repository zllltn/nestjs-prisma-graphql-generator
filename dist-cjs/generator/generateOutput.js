"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateOutput = void 0;
const path_1 = __importDefault(require("path"));
const helpers_1 = require("./helpers");
const generateOutput = (dmmfDocument, project, outputDir, model) => {
    const modelName = (0, helpers_1.camelCase)(model.name);
    const rootTypes = dmmfDocument.schema.outputTypes.filter((type) => ['Query', 'Mutation'].includes(type.name));
    const outputTypesToGenerate = dmmfDocument.schema.outputTypes.filter((type) => type.modelName === model.name && !rootTypes.includes(type));
    outputTypesToGenerate.forEach((type) => {
        const filePath = path_1.default.resolve(outputDir, modelName, 'outputs', `${type.typeName}.output.ts`);
        const sourceFile = project.createSourceFile(filePath, undefined, {
            overwrite: true,
        });
        sourceFile.addImportDeclaration({ moduleSpecifier: '@nestjs/graphql', namespaceImport: 'NestJsGraphQL' });
        const args = [];
        const outputs = [];
        const enums = [];
        outputTypesToGenerate.forEach((type) => {
            for (const item of [...new Set(type.fields.filter((it) => it.argsTypeName).map((it) => it.argsTypeName))].sort()) {
                if (!args.includes(item))
                    args.push(item);
            }
            for (const item of [
                ...new Set(type.fields.filter((field) => field.outputType.location === 'outputObjectTypes').map((field) => field.outputType.type)),
            ].sort()) {
                if (!outputs.includes(item))
                    outputs.push(item);
            }
            for (const item of [
                ...new Set(type.fields
                    .map((field) => field.outputType)
                    .filter((fieldType) => fieldType.location === 'enumTypes' && fieldType.namespace === 'model')
                    .map((fieldType) => fieldType.type)),
            ].sort()) {
                if (!enums.includes(item))
                    enums.push(item);
            }
        });
        if (args.length)
            sourceFile.addImportDeclaration({ moduleSpecifier: path_1.default.posix.join('..', `${modelName}.args`), namedImports: args });
        if (outputs.length) {
            for (const item of [...new Set(outputs)].sort()) {
                sourceFile.addImportDeclaration({ moduleSpecifier: `./${item}.output`, namedImports: [item] });
            }
        }
        if (enums.length) {
            for (const item of [...new Set(enums)].sort()) {
                sourceFile.addImportDeclaration({ moduleSpecifier: path_1.default.posix.join(`../../enums/${item}.enum`), namedImports: [item] });
            }
        }
        sourceFile.addClass({
            name: type.typeName,
            isExported: true,
            decorators: [
                {
                    name: 'NestJsGraphQL.ObjectType',
                    arguments: [`'${type.typeName}'`, ...(0, helpers_1.getArguments)(undefined, undefined, undefined, true, dmmfDocument.options.simpleResolvers)],
                },
            ],
            properties: type.fields.map((field) => ({
                name: field.name,
                type: field.fieldTSType,
                hasExclamationToken: true,
                hasQuestionToken: false,
                trailingTrivia: '\r\n',
                decorators: [
                    {
                        name: 'NestJsGraphQL.Field',
                        arguments: (0, helpers_1.getArguments)(field.typeGraphQLType, undefined, !field.isRequired),
                    },
                ],
            })),
        });
    });
};
exports.generateOutput = generateOutput;
//# sourceMappingURL=generateOutput.js.map