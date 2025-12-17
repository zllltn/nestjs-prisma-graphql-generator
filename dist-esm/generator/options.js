export const ALL_EMIT_BLOCK_KINDS = [
    'enums',
    'models',
    'crudResolvers',
    'relationResolvers',
    'inputs',
    'outputs',
];
export const BLOCKS_DEPENDENCIES_MAP = {
    enums: [],
    models: ['enums'],
    crudResolvers: ['models', 'enums', 'outputs', 'inputs'],
    relationResolvers: ['models', 'enums', 'inputs'],
    inputs: ['enums'],
    outputs: ['enums'],
};
export function getBlocksToEmit(emitOnly) {
    if (!emitOnly) {
        return ALL_EMIT_BLOCK_KINDS;
    }
    const blocks = new Set();
    for (const block of emitOnly) {
        blocks.add(block);
        const dependencies = BLOCKS_DEPENDENCIES_MAP[block];
        for (const dependency of dependencies) {
            blocks.add(dependency);
        }
    }
    return Array.from(blocks.values());
}
//# sourceMappingURL=options.js.map