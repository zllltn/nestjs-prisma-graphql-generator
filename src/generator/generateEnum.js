"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateEnums = void 0;
const path_1 = __importDefault(require("path"));
const generateEnums = (dmmfDocument, project, outputDir) => {
    const dirPath = path_1.default.resolve(outputDir, 'enums');
    dmmfDocument.datamodel.enums.forEach((enumDef) => {
        const filePath = path_1.default.resolve(dirPath, `${enumDef.typeName}.enum.ts`);
        const sourceFile = project.createSourceFile(filePath, undefined, {
            overwrite: true,
        });
        sourceFile.addImportDeclaration({ moduleSpecifier: '@nestjs/graphql', namespaceImport: 'NestJsGraphQL' });
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
exports.generateEnums = generateEnums;
//# sourceMappingURL=generateEnum.js.map