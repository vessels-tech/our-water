export default class ArrayUtils {
    /**
      * Merge two arrays together based on an accessor
      *
      * Note: This doesn't appear to preserve order.
      * @returns Array<T> - the modified array
      */
    static mergeArrays<T>(array1: Array<T>, array2: Array<T>, accessor: (any: T) => string): Array<T>;
    /**
     * Deduplicate an array of items based on an accessor.
     *
     * Note: This doesn't appear to preserve order.
     * @returns Array<T> - the modified array
     */
    static dedupArray<T>(array: Array<T>, accessor: (any: T) => string): Array<T>;
    /**
     * Deduplicate an array of items based on an accessor while preserving the order
     * of the elements. It removes the Earlier instances, not later.
     *
     * @returns Array<T> - the modified array
     */
    static dedupArrayPreserveOrder<T>(array: Array<T>, accessor: (any: T) => string): Array<T>;
}
