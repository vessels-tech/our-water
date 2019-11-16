import { DictType } from "./DictType";

export default class ArrayUtils {

  /**
    * Merge two arrays together based on an accessor
    * 
    * Note: This doesn't appear to preserve order.
    * @returns Array<T> - the modified array
    */
  public static mergeArrays<T>(array1: Array<T>, array2: Array<T>, accessor: (any: T) => string): Array<T> {
    const newArray = array1.concat(array2);
    return this.dedupArray<T>(newArray, accessor)
  }

  /**
   * Deduplicate an array of items based on an accessor.
   * 
   * Note: This doesn't appear to preserve order.
   * @returns Array<T> - the modified array
   */
  public static dedupArray<T>(array: Array<T>, accessor: (any: T) => string): Array<T> {
    const dedup: DictType<T> = {};
    array.forEach(r => {
      const id = accessor(r);
      dedup[id] = r;
    });
    return Object.keys(dedup).map(k => dedup[k]);
  }

  /**
   * Deduplicate an array of items based on an accessor while preserving the order
   * of the elements. It removes the Earlier instances, not later.
   *
   * @returns Array<T> - the modified array
   */
  public static dedupArrayPreserveOrder<T>(array: Array<T>, accessor: (any: T) => string): Array<T> {
    const idMap: DictType<T> = {};
    array.forEach(r => {
      const id = accessor(r);
      idMap[id] = r;
    });

    //First map the array to a list of ids only
    const dupIds = array.map(accessor);

    //Reverse the order of dupIds to keep right-most-items
    const revDupIds = dupIds.reverse()

    //Dedup the Ids (this works from the left only)
    const uniqueArray = revDupIds.filter((id, pos) => revDupIds.indexOf(id) === pos);

    //Map from ids back to array, with left-most duplicates removed
    return uniqueArray.map(id => idMap[id]);
  }

}

