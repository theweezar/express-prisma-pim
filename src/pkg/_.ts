function convertToString(value: unknown): string {
  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint') {
    return String(value);
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (value === null || value === undefined) {
    return '';
  }

  if (typeof value === 'object') {
    return JSON.stringify(value);
  }

  throw new Error('Cannot convert value to string');
}

function projectToTemplate(
  templateKeySet: Set<string>,
  input: Map<string, unknown>
): Map<string, string> {
  const result = new Map<string, string>();

  for (const key of templateKeySet) {
    const value = convertToString(input.get(key));
    result.set(key, value);
  }

  return result
}

function hasValue(val: any) {
  return val !== null && val !== undefined && val !== '';
}

function uniqueValuesOf<T, K extends keyof T>(
  collection: ReadonlyArray<T>,
  key: K
): Set<T[K]> {
  return new Set(collection.map(item => item[key]).filter(Boolean));
}

function indexBy<T, K extends keyof T>(
  collection: ReadonlyArray<T>,
  key: K
): Map<T[K], T> {
  return new Map<T[K], T>(collection.map(item => [item[key], item]));
}

const _ = {
  convertToString,
  projectToTemplate,
  hasValue,
  uniqueValuesOf,
  indexBy
};

export default _;
