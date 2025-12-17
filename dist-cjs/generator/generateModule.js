"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateModule = void 0;
const path_1 = __importDefault(require("path"));
const helpers_1 = require("./helpers");
const generateModule = (project, outputDir, model) => {
    const modelName = (0, helpers_1.camelCase)(model.name);
    const filePath = path_1.default.resolve(outputDir, `${modelName}/${modelName}.module.ts`);
    const sourceFile = project.createSourceFile(filePath, undefined, { overwrite: true });
    sourceFile.addStatements(`import { Module } from '@nestjs/common'
    import { ${model.name}Service } from './${modelName}.service'
    import { ${model.name}Resolver } from './${modelName}.resolver'
    import { PrismaService } from '../../prisma.service'
    
    @Module({
      providers: [${model.name}Resolver, ${model.name}Service, PrismaService]
    })
    export class ${model.name}Module {}
  `);
};
exports.generateModule = generateModule;
//# sourceMappingURL=generateModule.js.map