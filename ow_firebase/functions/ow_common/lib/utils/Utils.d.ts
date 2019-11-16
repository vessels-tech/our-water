/**
 * Get the lower of two values.
 * if maybe is undefined, return the lowervalue
 *
 * @param maybe
 * @param lowerValue
 */
export declare function safeLower(maybe: number | undefined | null, lowerValue: number): number;
/**
 * Saftely get things and check if null
 *
 * @example:
 *   const userId = get(req, ['user', 'uid']);
 */
export declare function safeGetNested(o: any, p: string[]): any;
/**
 * Saftely get things and check if null
 *
 * @example:
 *   const userId = get(req, ['user', 'uid']);
 */
export declare function safeGetNestedDefault<T>(o: any, p: string[], backup: T): any;
/**
 * Split an array up into an array of chuncks
 */
export declare function chunkArray(array: any[], size: number): any[][];
