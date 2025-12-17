"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generate = generate;
const internals_1 = require("@prisma/internals");
const path_1 = __importDefault(require("path"));
const ts_morph_1 = require("ts-morph");
const DmmfDocument_1 = require("./generator/dmmf/DmmfDocument");
const generateArgs_1 = require("./generator/generateArgs");
const generateCommonEnums_1 = require("./generator/generateCommonEnums");
const generateCommonInput_1 = require("./generator/generateCommonInput");
const generateCommonOutput_1 = require("./generator/generateCommonOutput");
const generateEnum_1 = require("./generator/generateEnum");
const generateInput_1 = require("./generator/generateInput");
const generateModel_1 = require("./generator/generateModel");
const generateModule_1 = require("./generator/generateModule");
const generateOutput_1 = require("./generator/generateOutput");
const generateResolver_1 = require("./generator/generateResolver");
const generateService_1 = require("./generator/generateService");
const helpers_1 = require("./generator/helpers");
const options_1 = require("./generator/options");
const helpers_2 = require("./helpers");
async function generate(options) {
    var _a, _b;
    const outputDir = (0, internals_1.parseEnvValue)(options.generator.output);
    if (!outputDir)
        throw new Error('No output was specified for nestjs-prisma-graphql-crud-gen');
    const generatorConfig = options.generator.config;
    const prismaClientProvider = options.otherGenerators.find((it) => (0, internals_1.parseEnvValue)(it.provider) === 'prisma-client-js');
    const prismaClientPath = (0, internals_1.parseEnvValue)(prismaClientProvider.output);
    const dmmfDocument = new DmmfDocument_1.DmmfDocument(await (0, internals_1.getDMMF)({
        datamodel: options.datamodel,
        previewFeatures: prismaClientProvider.previewFeatures,
    }), {
        emitDMMF: (0, helpers_2.parseStringBoolean)(generatorConfig.emitDMMF),
        emitTranspiledCode: (0, helpers_2.parseStringBoolean)(generatorConfig.emitTranspiledCode),
        simpleResolvers: (0, helpers_2.parseStringBoolean)(generatorConfig.simpleResolvers),
        useOriginalMapping: (0, helpers_2.parseStringBoolean)(generatorConfig.useOriginalMapping),
        useUncheckedScalarInputs: (0, helpers_2.parseStringBoolean)(generatorConfig.useUncheckedScalarInputs),
        emitIdAsIDType: (0, helpers_2.parseStringBoolean)(generatorConfig.emitIdAsIDType),
        customPrismaImportPath: generatorConfig.customPrismaImportPath,
        outputDirPath: outputDir,
        relativePrismaOutputPath: (0, helpers_1.toUnixPath)(path_1.default.relative(outputDir, prismaClientPath)),
        absolutePrismaOutputPath: prismaClientPath.includes('node_modules')
            ? '@prisma/client'
            : undefined,
        blocksToEmit: (0, options_1.getBlocksToEmit)((0, helpers_2.parseStringArray)(generatorConfig.emitOnly, 'emitOnly', options_1.ALL_EMIT_BLOCK_KINDS)),
        contextPrismaKey: (_a = generatorConfig.contextPrismaKey) !== null && _a !== void 0 ? _a : 'prisma',
    });
    const emitTranspiledCode = (_b = (0, helpers_2.parseStringBoolean)(generatorConfig.emitTranspiledCode)) !== null && _b !== void 0 ? _b : outputDir.includes('node_modules');
    const project = new ts_morph_1.Project({
        compilerOptions: {
            target: ts_morph_1.ScriptTarget.ES2019,
            module: ts_morph_1.ModuleKind.CommonJS,
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
    (0, generateCommonEnums_1.generateCommonEnums)(dmmfDocument, project, outputDir);
    (0, generateEnum_1.generateEnums)(dmmfDocument, project, outputDir);
    (0, generateCommonInput_1.generateCommonInput)(dmmfDocument, project, outputDir);
    (0, generateCommonOutput_1.generateCommonOutput)(dmmfDocument, project, outputDir);
    dmmfDocument.datamodel.models.forEach((model) => {
        (0, generateModel_1.generateModel)(dmmfDocument, project, outputDir, model);
        (0, generateInput_1.generateInput)(dmmfDocument, project, outputDir, model);
        (0, generateOutput_1.generateOutput)(dmmfDocument, project, outputDir, model);
        (0, generateArgs_1.generateArgs)(dmmfDocument, project, outputDir, model);
        (0, generateResolver_1.generateResolver)(project, outputDir, model);
        (0, generateService_1.generateService)(project, outputDir, model);
        (0, generateModule_1.generateModule)(project, outputDir, model);
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