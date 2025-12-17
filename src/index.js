#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const generator_helper_1 = require("@prisma/generator-helper");
const internals_1 = require("@prisma/internals");
const generator_1 = require("./generator");
const GENERATOR_NAME = 'nestjs-prisma-graphql-crud-gen';
(0, generator_helper_1.generatorHandler)({
    onManifest() {
        internals_1.logger.info(`${GENERATOR_NAME}:Registered`);
        return {
            defaultOutput: '../generated',
            prettyName: GENERATOR_NAME,
        };
    },
    onGenerate: generator_1.generate,
});
//# sourceMappingURL=index.js.map