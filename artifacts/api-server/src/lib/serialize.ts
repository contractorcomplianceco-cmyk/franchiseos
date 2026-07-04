export function toIso<T extends Record<string, unknown>>(
  row: T,
  keys: (keyof T)[],
): T {
  const out: Record<string, unknown> = { ...row };
  for (const key of keys) {
    const value = row[key];
    if (value instanceof Date) {
      out[key as string] = value.toISOString();
    }
  }
  return out as T;
}
