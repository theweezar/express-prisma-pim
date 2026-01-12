function fillTemplateMap(
  templateKeySet: Set<string>,
  input: Map<string, unknown>
): Map<string, string> {
  const result = new Map<string, string>()

  for (const key of templateKeySet) {
    const value = input.get(key);

    if (typeof value === 'string') {
      result.set(key, value)
      continue
    }

    if (
      typeof value === 'number' ||
      typeof value === 'boolean' ||
      typeof value === 'bigint'
    ) {
      result.set(key, String(value))
      continue
    }

    if (value instanceof Date) {
      result.set(key, value.toISOString())
      continue
    }

    if (value === null || value === undefined) {
      result.set(key, '')
      continue
    }

    if (typeof value === 'object') {
      result.set(key, JSON.stringify(value))
      continue
    }

    throw new Error(
      `Cannot convert value of key "${key}" to string`
    )
  }

  return result
}

function hasValue(val: any) {
  return val !== null && val !== undefined && val !== '';
}

function mapToSet<T, K extends keyof T>(
  collection: ReadonlyArray<T>,
  key: K
): Set<T[K]> {
  return new Set(collection.map(item => item[key]).filter(Boolean));
}

const _ = {
  fillTemplateMap,
  hasValue,
  mapToSet
};

export default _;
