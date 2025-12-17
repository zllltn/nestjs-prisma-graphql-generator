import { getDMMF, parseEnvValue } from '@prisma/internals';
import path from 'path';
import { ModuleKind, Project, ScriptTarget } from 'ts-morph';
import { DmmfDocument } from './generator/dmmf/DmmfDocument';
import { generateArgs } from './generator/generateArgs';
import { generateCommonEnums } from './generator/generateCommonEnums';
import { generateCommonInput } from './generator/generateCommonInput';
import { generateCommonOutput } from './generator/generateCommonOutput';
import { generateEnums } from './generator/generateEnum';
import { generateInput } from './generator/generateInput';
import { generateModel } from './generator/generateModel';
import { generateModule } from './generator/generateModule';
import { generateOutput } from './generator/generateOutput';
import { generateResolver } from './generator/generateResolver';
import { generateService } from './generator/generateService';
import { toUnixPath } from './generator/helpers';
import { ALL_EMIT_BLOCK_KINDS, getBlocksToEmit } from './generator/options';
import { parseStringArray, parseStringBoolean } from './helpers';
export async function generate(options) {
    var _a, _b;
    const outputDir = parseEnvValue(options.generator.output);
    if (!outputDir)
        throw new Error('No output was specified for nestjs-prisma-graphql-crud-gen');
    const generatorConfig = options.generator.config;
    const prismaClientProvider = options.otherGenerators.find((it) => parseEnvValue(it.provider) === 'prisma-client-js');
    const prismaClientPath = parseEnvValue(prismaClientProvider.output);
    const dmmfDocument = new DmmfDocument(await getDMMF({
        datamodel: options.datamodel,
        previewFeatures: prismaClientProvider.previewFeatures,
    }), {
        emitDMMF: parseStringBoolean(generatorConfig.emitDMMF),
        emitTranspiledCode: parseStringBoolean(generatorConfig.emitTranspiledCode),
        simpleResolvers: parseStringBoolean(generatorConfig.simpleResolvers),
        useOriginalMapping: parseStringBoolean(generatorConfig.useOriginalMapping),
        useUncheckedScalarInputs: parseStringBoolean(generatorConfig.useUncheckedScalarInputs),
        emitIdAsIDType: parseStringBoolean(generatorConfig.emitIdAsIDType),
        customPrismaImportPath: generatorConfig.customPrismaImportPath,
        outputDirPath: outputDir,
        relativePrismaOutputPath: toUnixPath(path.relative(outputDir, prismaClientPath)),
        absolutePrismaOutputPath: prismaClientPath.includes('node_modules')
            ? '@prisma/client'
            : undefined,
        blocksToEmit: getBlocksToEmit(parseStringArray(generatorConfig.emitOnly, 'emitOnly', ALL_EMIT_BLOCK_KINDS)),
        contextPrismaKey: (_a = generatorConfig.contextPrismaKey) !== null && _a !== void 0 ? _a : 'prisma',
    });
    const emitTranspiledCode = (_b = parseStringBoolean(generatorConfig.emitTranspiledCode)) !== null && _b !== void 0 ? _b : outputDir.includes('node_modules');
    const project = new Project({
        compilerOptions: {
            target: ScriptTarget.ES2019,
            module: ModuleKind.CommonJS,
            emitDecoratorMetadata: true,
            experimentalDecorators: true,
            esModuleInterop: true,
            declaration: true,
            importHelpers: true,
            ...(emitTranspiledCode && {
                declaration: true,
                importHelpers: true,
            }),
        },
    });
    generateCommonEnums(dmmfDocument, project, outputDir);
    generateEnums(dmmfDocument, project, outputDir);
    generateCommonInput(dmmfDocument, project, outputDir);
    generateCommonOutput(dmmfDocument, project, outputDir);
    dmmfDocument.datamodel.models.forEach((model) => {
        generateModel(dmmfDocument, project, outputDir, model);
        generateInput(dmmfDocument, project, outputDir, model);
        generateOutput(dmmfDocument, project, outputDir, model);
        generateArgs(dmmfDocument, project, outputDir, model);
        generateResolver(project, outputDir, model);
        generateService(project, outputDir, model);
        generateModule(project, outputDir, model);
    });
    for (const sourceFile of project.getSourceFiles()) {
        sourceFile.fixMissingImports().organizeImports().fixUnusedIdentifiers().formatText();
    }
    try {
        if (emitTranspiledCode)
            await project.emit();
        else {
            for (const file of project.getSourceFiles()) {
                file.formatText({ indentSize: 2 });
            }
            await project.save();
        }
    }
    catch (e) {
        console.error('Error: unable to write files for nestjs-prisma-graphql-crud-gen');
        throw e;
    }
}
//# sourceMappingURL=generator.js.map