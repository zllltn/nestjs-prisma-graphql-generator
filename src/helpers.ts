export function parseStringBoolean(stringBoolean: string | string[] | undefined) {
  return stringBoolean ? stringBoolean === 'true' : undefined;
}

export function parseStringArray<TAllowedValue extends string>(
  stringArray: string | undefined | string[],
  optionPropertyName: string,
  allowedValues?: TAllowedValue[],
): TAllowedValue[] | undefined {
  if (!stringArray) {
    return undefined;
  }

  const parsedArray = (Array.isArray(stringArray) ? stringArray : stringArray.split(',')).map(
    (it) => it.trim(),
  );

  if (allowedValues) {
    for (const option of parsedArray) {
      if (!allowedValues.includes(option as any)) {
        throw new Error(
          `Invalid "${optionPropertyName}" option value "${option}" provided for NestJsGraphQL generator.`,
        );
      }
    }
  }
  return parsedArray as TAllowedValue[];
}
