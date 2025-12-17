export const modelAttributeRegex = /(@@NestJsGraphQL\.)+([A-z])+(\()+(.+)+(\))+/;
export const fieldAttributeRegex = /(@NestJsGraphQL\.)+([A-z])+(\()+(.+)+(\))+/;
export const attributeNameRegex = /(?:\.)+([A-Za-z])+(?:\()+/;
export const attributeArgsRegex = /(?:\()+([A-Za-z])+\:+(.+)+(?:\))+/;
export function parseDocumentationAttributes(documentation, expectedAttributeName, expectedAttributeKind) {
    var _a, _b, _c, _d, _e;
    const attributeRegex = expectedAttributeKind === 'model' ? modelAttributeRegex : fieldAttributeRegex;
    const attribute = (_a = documentation === null || documentation === void 0 ? void 0 : documentation.match(attributeRegex)) === null || _a === void 0 ? void 0 : _a[0];
    const attributeName = (_c = (_b = attribute === null || attribute === void 0 ? void 0 : attribute.match(attributeNameRegex)) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.slice(1, -1);
    if (attributeName !== expectedAttributeName) {
        return {};
    }
    const rawAttributeArgs = (_e = (_d = attribute === null || attribute === void 0 ? void 0 : attribute.match(attributeArgsRegex)) === null || _d === void 0 ? void 0 : _d[0]) === null || _e === void 0 ? void 0 : _e.slice(1, -1);
    const parsedAttributeArgs = {};
    if (rawAttributeArgs) {
        const rawAttributeArgsParts = rawAttributeArgs
            .split(':')
            .map((it) => it.trim())
            .map((part) => (part.startsWith('[') ? part : part.split(',')))
            .flat()
            .map((it) => it.trim());
        for (let i = 0; i < rawAttributeArgsParts.length; i += 2) {
            const key = rawAttributeArgsParts[i];
            const value = rawAttributeArgsParts[i + 1];
            parsedAttributeArgs[key] = JSON.parse(value);
        }
    }
    return parsedAttributeArgs;
}
//# sourceMappingURL=helpers.js.map