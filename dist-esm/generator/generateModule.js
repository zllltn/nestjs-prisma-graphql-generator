import path from 'path';
import { camelCase } from './helpers';
export const generateModule = (project, outputDir, model) => {
    const modelName = camelCase(model.name);
    const filePath = path.resolve(outputDir, `${modelName}/${modelName}.module.ts`);
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
//# sourceMappingURL=generateModule.js.map