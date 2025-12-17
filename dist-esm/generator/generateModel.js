import path from 'path';
import { camelCase, convertNewLines, getArguments } from './helpers';
export const generateModel = (dmmfDocument, project, outputDir, model) => {
    const modelName = camelCase(model.name);
    const writeLocation = path.join(outputDir, 'models', `${modelName}.model.ts`);
    const sourceFile = project.createSourceFile(writeLocation, undefined, {
        overwrite: true,
    });
    const modelOutputType = dmmfDocument.schema.outputTypes.find((type) => type.name === model.name);
    sourceFile.addImportDeclaration({ moduleSpecifier: '@nestjs/graphql', namespaceImport: 'NestJsGraphQL' });
    const enums = model.fields.filter((field) => field.location === 'enumTypes').map((field) => field.type);
    for (const item of [...new Set(enums)].sort()) {
        sourceFile.addImportDeclaration({
            moduleSpecifier: path.posix.join('../enums', `${item}.enum`),
            namedImports: enums,
        });
    }
    const models = model.fields
        .filter((field) => field.location === 'outputObjectTypes')
        .filter((field) => field.type !== model.name)
        .map((field) => (dmmfDocument.isModelName(field.type) ? dmmfDocument.getModelTypeName(field.type) : field.type));
    for (const item of [...new Set(models)].sort()) {
        sourceFile.addImportDeclaration({
            moduleSpecifier: path.posix.join('../models', `${camelCase(item)}.model`),
            namedImports: [item],
        });
    }
    const countField = modelOutputType.fields.find((it) => it.name === '_count');
    const shouldEmitCountField = countField !== undefined && dmmfDocument.shouldGenerateBlock('crudResolvers');
    if (shouldEmitCountField) {
        for (const elementName of [...new Set([countField.typeGraphQLType])].sort()) {
            sourceFile.addImportDeclaration({
                moduleSpecifier: path.posix.join('..', modelName, 'outputs', `${elementName}.output`),
                namedImports: [elementName],
            });
        }
    }
    sourceFile.addClass({
        name: model.typeName,
        isExported: true,
        decorators: [
            {
                name: 'NestJsGraphQL.ObjectType',
                arguments: [`'${model.typeName}'`, ...getArguments(undefined, model.docs, undefined, true, dmmfDocument.options.simpleResolvers)],
            },
        ],
        properties: [
            ...model.fields.map((field) => {
                const isOptional = !!field.relationName || field.isOmitted.output || (!field.isRequired && field.typeFieldAlias === undefined);
                return {
                    name: field.name,
                    type: field.fieldTSType,
                    hasExclamationToken: !isOptional,
                    hasQuestionToken: isOptional,
                    trailingTrivia: '\r\n',
                    decorators: [
                        ...(field.relationName || field.typeFieldAlias || field.isOmitted.output
                            ? []
                            : [{ name: 'NestJsGraphQL.Field', arguments: getArguments(field.typeGraphQLType, field.docs, isOptional) }]),
                    ],
                    ...(field.docs && {
                        docs: [{ description: `\n${convertNewLines(field.docs)}` }],
                    }),
                };
            }),
            ...(shouldEmitCountField
                ? [
                    {
                        name: countField.name,
                        type: countField.fieldTSType,
                        hasExclamationToken: countField.isRequired,
                        hasQuestionToken: !countField.isRequired,
                        trailingTrivia: '\r\n',
                        decorators: [{ name: 'NestJsGraphQL.Field', arguments: getArguments(countField.typeGraphQLType, undefined, true) }],
                    },
                ]
                : []),
        ],
        getAccessors: model.fields
            .filter((field) => field.typeFieldAlias && !field.relationName && !field.isOmitted.output)
            .map((field) => {
            return {
                name: field.typeFieldAlias,
                returnType: field.fieldTSType,
                trailingTrivia: '\r\n',
                decorators: [
                    {
                        name: 'NestJsGraphQL.Field',
                        arguments: getArguments(field.typeGraphQLType, field.docs, !field.isRequired),
                    },
                ],
                statements: [field.isRequired ? `return this.${field.name};` : `return this.${field.name} ?? null;`],
                ...(field.docs && {
                    docs: [{ description: `\n${convertNewLines(field.docs)}` }],
                }),
            };
        }),
        ...(model.docs && {
            docs: [{ description: `\n${convertNewLines(model.docs)}` }],
        }),
    });
};
//# sourceMappingURL=generateModel.js.map