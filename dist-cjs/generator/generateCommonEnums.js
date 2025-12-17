"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateCommonEnums = void 0;
const path_1 = __importDefault(require("path"));
const generateCommonEnums = (dmmfDocument, project, outputDir) => {
    const dirPath = path_1.default.resolve(outputDir, 'common');
    const filePath = path_1.default.resolve(dirPath, 'enums.ts');
    const sourceFile = project.createSourceFile(filePath, undefined, {
        overwrite: true,
    });
    sourceFile.addImportDeclaration({ moduleSpecifier: '@nestjs/graphql', namespaceImport: 'NestJsGraphQL' });
    const datamodelEnumNames = dmmfDocument.datamodel.enums.map((enumDef) => enumDef.typeName);
    datamodelEnumNames.forEach((enumDef) => {
        sourceFile.addStatements([
            `export * from "../enums/${enumDef}.enum";`
        ]);
    });
    dmmfDocument.schema.enums
        .filter((enumDef) => !datamodelEnumNames.includes(enumDef.typeName))
        .forEach((enumDef) => {
        sourceFile.addEnum({
            isExported: true,
            name: enumDef.typeName,
            members: enumDef.valuesMap.map(({ name, value }) => ({
                name,
                value,
            })),
        });
        sourceFile.addStatements([
            `NestJsGraphQL.registerEnumType(${enumDef.typeName}, {
          name: "${enumDef.typeName}",
          description: ${enumDef.docs ? `"${enumDef.docs}"` : 'undefined'},
        });`,
        ]);
    });
};
exports.generateCommonEnums = generateCommonEnums;
//# sourceMappingURL=generateCommonEnums.js.map