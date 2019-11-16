
/**
 * Get the lower of two values.
 * if maybe is undefined, return the lowervalue
 * 
 * @param maybe 
 * @param lowerValue 
 */
export function safeLower(maybe: number | undefined | null, lowerValue: number): number {
  if (!maybe) {
    return lowerValue;
  }

  if (maybe > lowerValue) {
    return lowerValue;
  }

  return maybe;
}

/**
 * Saftely get things and check if null
 * 
 * @example:
 *   const userId = get(req, ['user', 'uid']);
 */
export function safeGetNested(o: any, p: string[]) {
  return p.reduce((xs, x) =>
    (xs && xs[x]) ? xs[x] : null, o);
}

/**
 * Saftely get things and check if null
 * 
 * @example:
 *   const userId = get(req, ['user', 'uid']);
 */
export function safeGetNestedDefault<T>(o: any, p: string[], backup: T) {
  return p.reduce((xs, x) =>
    (xs && xs[x]) ? xs[x] : backup, o);
}

/**
 * Split an array up into an array of chuncks
 */
export function chunkArray(array: any[], size: number): any[][] {
  const chunks = [];
  let i = 0;
  let n = array.length;

  while (i < n) {
    chunks.push(array.slice(i, i += size));
  }

  return chunks;
}

