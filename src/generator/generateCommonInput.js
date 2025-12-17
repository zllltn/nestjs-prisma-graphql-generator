"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateCommonInput = void 0;
const path_1 = __importDefault(require("path"));
const helpers_1 = require("./helpers");
const generateCommonInput = (dmmfDocument, project, outputDir) => {
    const dirPath = path_1.default.resolve(outputDir, 'common', 'inputs');
    dmmfDocument.schema.inputTypes
        .filter((inputType) => !inputType.modelType)
        .forEach((inputType) => {
        const filePath = path_1.default.resolve(dirPath, `${inputType.typeName}.input.ts`);
        const sourceFile = project.createSourceFile(filePath, undefined, {
            overwrite: true,
        });
        sourceFile.addImportDeclaration({ moduleSpecifier: '@nestjs/graphql', namespaceImport: 'NestJsGraphQL' });
        const enumsPrisma = [];
        const enumsModel = [];
        dmmfDocument.schema.inputTypes.forEach((inputType) => {
            enumsPrisma.push(...inputType.fields
                .map((field) => field.selectedInputType)
                .filter((fieldType) => fieldType.location === 'enumTypes' && fieldType.namespace === 'prisma')
                .map((fieldType) => fieldType.type));
            enumsModel.push(...inputType.fields
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
                    arguments: [`'${inputType.typeName}'`, ...(0, helpers_1.getArguments)(undefined, undefined, undefined, true)],
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
exports.generateCommonInput = generateCommonInput;
//# sourceMappingURL=generateCommonInput.js.map