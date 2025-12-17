"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateArgs = void 0;
const path_1 = __importDefault(require("path"));
const helpers_1 = require("./helpers");
const generateArgs = (dmmfDocument, project, outputDir, model) => {
    const modelName = (0, helpers_1.camelCase)(model.name);
    const writeLocation = path_1.default.join(outputDir, modelName, `${modelName}.args.ts`);
    const sourceFile = project.createSourceFile(writeLocation, undefined, {
        overwrite: true,
    });
    sourceFile.addImportDeclaration({ moduleSpecifier: '@nestjs/graphql', namespaceImport: 'NestJsGraphQL' });
    const commonEnums = [];
    dmmfDocument.modelMappings.forEach(async (mapping) => {
        const actionsWithArgs = mapping.actions.filter((it) => it.argsTypeName !== undefined);
        if (actionsWithArgs.length) {
            actionsWithArgs.forEach(async (action) => {
                const fields = action.method.args;
                for (const item of [
                    ...new Set(fields
                        .map((arg) => arg.selectedInputType)
                        .filter((argInputType) => argInputType.location === 'inputObjectTypes')
                        .map((argInputType) => argInputType.type)),
                ].sort()) {
                    sourceFile.addImportDeclaration({
                        moduleSpecifier: `../${modelName}/inputs/${item}.input`,
                        namedImports: [item],
                    });
                }
                for (const item of [
                    ...new Set(fields
                        .filter((field) => !field.typeName)
                        .map((field) => field.selectedInputType)
                        .filter((argType) => argType.location === 'enumTypes' && argType.namespace === 'model')
                        .map((argType) => argType.type)),
                ].sort()) {
                    sourceFile.addImportDeclaration({
                        moduleSpecifier: `../enums/${item}.enum`,
                        namedImports: [item],
                    });
                }
                for (const item of [
                    ...new Set(fields
                        .filter((field) => field.typeName)
                        .map((field) => field.selectedInputType)
                        .filter((argType) => argType.location === 'enumTypes')
                        .map((argType) => argType.type)),
                ].sort()) {
                    if (!commonEnums.includes(item))
                        commonEnums.push(item);
                }
            });
        }
    });
    if (commonEnums.length) {
        sourceFile.addImportDeclaration({
            moduleSpecifier: `../common/enums`,
            namedImports: commonEnums,
        });
    }
    dmmfDocument.modelMappings.forEach(async (mapping) => {
        const actionsWithArgs = mapping.actions.filter((it) => it.argsTypeName !== undefined && it.argsTypeName.includes(model.name));
        if (actionsWithArgs.length) {
            actionsWithArgs.forEach(async (action) => {
                const fields = action.method.args;
                sourceFile.addClass({
                    name: action.argsTypeName,
                    isExported: true,
                    decorators: [
                        {
                            name: 'NestJsGraphQL.ArgsType',
                            arguments: [],
                        },
                    ],
                    properties: fields.map((arg) => {
                        return {
                            name: arg.typeName,
                            type: arg.fieldTSType,
                            hasExclamationToken: arg.isRequired,
                            hasQuestionToken: !arg.isRequired,
                            trailingTrivia: '\r\n',
                            decorators: [
                                {
                                    name: 'NestJsGraphQL.Field',
                                    arguments: (0, helpers_1.getArguments)(arg.typeGraphQLType, undefined, !arg.isRequired),
                                },
                            ],
                        };
                    }),
                });
            });
        }
    });
};
exports.generateArgs = generateArgs;
//# sourceMappingURL=generateArgs.js.map