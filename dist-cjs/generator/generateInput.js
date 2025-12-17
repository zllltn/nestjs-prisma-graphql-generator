"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateInput = void 0;
const path_1 = __importDefault(require("path"));
const helpers_1 = require("./helpers");
const generateInput = (dmmfDocument, project, outputDir, model) => {
    const modelName = (0, helpers_1.camelCase)(model.name);
    const inputTypesToGenerate = dmmfDocument.schema.inputTypes.filter((inputType) => inputType.modelType && inputType.modelName === model.name);
    inputTypesToGenerate.forEach((inputType) => {
        const filePath = path_1.default.resolve(outputDir, `${modelName}/inputs/${inputType.typeName}.input.ts`);
        const sourceFile = project.createSourceFile(filePath, undefined, {
            overwrite: true,
        });
        sourceFile.addImportDeclaration({ moduleSpecifier: '@nestjs/graphql', namespaceImport: 'NestJsGraphQL' });
        dmmfDocument.schema.inputTypes
            .filter((_inputType) => !_inputType.modelType)
            .forEach((_inputType) => {
            sourceFile.addImportDeclaration({
                moduleSpecifier: `../../common/inputs/${_inputType.typeName}.input`,
                namedImports: [_inputType.typeName],
            });
        });
        dmmfDocument.schema.inputTypes
            .filter((_inputType) => _inputType.modelType && _inputType.typeName !== inputType.typeName)
            .forEach((_inputType) => {
            sourceFile.addImportDeclaration({
                moduleSpecifier: `../../${(0, helpers_1.camelCase)(_inputType.modelName)}/inputs/${_inputType.typeName}.input`,
                namedImports: [_inputType.typeName],
            });
        });
        const enumsPrisma = [];
        const enumsModel = [];
        dmmfDocument.schema.inputTypes.forEach((_inputType) => {
            enumsPrisma.push(..._inputType.fields
                .map((field) => field.selectedInputType)
                .filter((fieldType) => fieldType.location === 'enumTypes' && fieldType.namespace === 'prisma')
                .map((fieldType) => fieldType.type));
            enumsModel.push(..._inputType.fields
                .map((field) => field.selectedInputType)
                .filter((fieldType) => fieldType.location === 'enumTypes' && fieldType.namespace === 'model')
                .map((fieldType) => fieldType.type));
        });
        if (enumsPrisma.length) {
            sourceFile.addImportDeclaration({
                moduleSpecifier: '../../common/enums',
                namedImports: [...new Set(enumsPrisma)],
            });
        }
        if (enumsModel.length) {
            enumsModel.forEach((name) => {
                sourceFile.addImportDeclaration({
                    moduleSpecifier: `../../enums/${name}.enum`,
                    namedImports: [name],
                });
            });
        }
        const fieldsToEmit = inputType.fields.filter((field) => !field.isOmitted);
        const mappedFields = fieldsToEmit.filter((field) => field.hasMappedName);
        sourceFile.addClass({
            name: inputType.typeName,
            isExported: true,
            decorators: [
                {
                    name: 'NestJsGraphQL.InputType',
                    arguments: [`'${inputType.typeName}'`, ...(0, helpers_1.getArguments)(undefined, undefined, false, true)],
                },
            ],
            properties: fieldsToEmit.map((field) => {
                return {
                    name: field.name,
                    type: field.fieldTSType,
                    hasExclamationToken: !!field.isRequired,
                    hasQuestionToken: !field.isRequired,
                    trailingTrivia: '\r\n',
                    decorators: field.hasMappedName
                        ? []
                        : [
                            {
                                name: 'NestJsGraphQL.Field',
                                arguments: (0, helpers_1.getArguments)(field.typeGraphQLType, undefined, !field.isRequired),
                            },
                        ],
                };
            }),
            getAccessors: mappedFields.map((field) => {
                return {
                    name: field.typeName,
                    type: field.fieldTSType,
                    hasExclamationToken: field.isRequired,
                    hasQuestionToken: !field.isRequired,
                    trailingTrivia: '\r\n',
                    statements: [`return this.${field.name};`],
                    decorators: [
                        {
                            name: 'NestJsGraphQL.Field',
                            arguments: (0, helpers_1.getArguments)(field.typeGraphQLType, undefined, !field.isRequired),
                        },
                    ],
                };
            }),
            setAccessors: mappedFields.map((field) => {
                return {
                    name: field.typeName,
                    type: field.fieldTSType,
                    hasExclamationToken: field.isRequired,
                    hasQuestionToken: !field.isRequired,
                    trailingTrivia: '\r\n',
                    parameters: [{ name: field.name, type: field.fieldTSType }],
                    statements: [`this.${field.name} = ${field.name};`],
                };
            }),
        });
    });
};
exports.generateInput = generateInput;
//# sourceMappingURL=generateInput.js.map