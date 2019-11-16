"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.safeLower = safeLower;
exports.safeGetNested = safeGetNested;
exports.safeGetNestedDefault = safeGetNestedDefault;
exports.chunkArray = chunkArray;

/**
 * Get the lower of two values.
 * if maybe is undefined, return the lowervalue
 * 
 * @param maybe 
 * @param lowerValue 
 */
function safeLower(maybe, lowerValue) {
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


function safeGetNested(o, p) {
  return p.reduce(function (xs, x) {
    return xs && xs[x] ? xs[x] : null;
  }, o);
}
/**
 * Saftely get things and check if null
 * 
 * @example:
 *   const userId = get(req, ['user', 'uid']);
 */


function safeGetNestedDefault(o, p, backup) {
  return p.reduce(function (xs, x) {
    return xs && xs[x] ? xs[x] : backup;
  }, o);
}
/**
 * Split an array up into an array of chuncks
 */


function chunkArray(array, size) {
  var chunks = [];
  var i = 0;
  var n = array.length;

  while (i < n) {
    chunks.push(array.slice(i, i += size));
  }

  return chunks;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlscy9VdGlscy50cyJdLCJuYW1lcyI6WyJzYWZlTG93ZXIiLCJtYXliZSIsImxvd2VyVmFsdWUiLCJzYWZlR2V0TmVzdGVkIiwibyIsInAiLCJyZWR1Y2UiLCJ4cyIsIngiLCJzYWZlR2V0TmVzdGVkRGVmYXVsdCIsImJhY2t1cCIsImNodW5rQXJyYXkiLCJhcnJheSIsInNpemUiLCJjaHVua3MiLCJpIiwibiIsImxlbmd0aCIsInB1c2giLCJzbGljZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUNBOzs7Ozs7O0FBT08sU0FBU0EsU0FBVCxDQUFtQkMsS0FBbkIsRUFBcURDLFVBQXJELEVBQWlGO0FBQ3RGLE1BQUksQ0FBQ0QsS0FBTCxFQUFZO0FBQ1YsV0FBT0MsVUFBUDtBQUNEOztBQUVELE1BQUlELEtBQUssR0FBR0MsVUFBWixFQUF3QjtBQUN0QixXQUFPQSxVQUFQO0FBQ0Q7O0FBRUQsU0FBT0QsS0FBUDtBQUNEO0FBRUQ7Ozs7Ozs7O0FBTU8sU0FBU0UsYUFBVCxDQUF1QkMsQ0FBdkIsRUFBK0JDLENBQS9CLEVBQTRDO0FBQ2pELFNBQU9BLENBQUMsQ0FBQ0MsTUFBRixDQUFTLFVBQUNDLEVBQUQsRUFBS0MsQ0FBTDtBQUFBLFdBQ2JELEVBQUUsSUFBSUEsRUFBRSxDQUFDQyxDQUFELENBQVQsR0FBZ0JELEVBQUUsQ0FBQ0MsQ0FBRCxDQUFsQixHQUF3QixJQURWO0FBQUEsR0FBVCxFQUN5QkosQ0FEekIsQ0FBUDtBQUVEO0FBRUQ7Ozs7Ozs7O0FBTU8sU0FBU0ssb0JBQVQsQ0FBaUNMLENBQWpDLEVBQXlDQyxDQUF6QyxFQUFzREssTUFBdEQsRUFBaUU7QUFDdEUsU0FBT0wsQ0FBQyxDQUFDQyxNQUFGLENBQVMsVUFBQ0MsRUFBRCxFQUFLQyxDQUFMO0FBQUEsV0FDYkQsRUFBRSxJQUFJQSxFQUFFLENBQUNDLENBQUQsQ0FBVCxHQUFnQkQsRUFBRSxDQUFDQyxDQUFELENBQWxCLEdBQXdCRSxNQURWO0FBQUEsR0FBVCxFQUMyQk4sQ0FEM0IsQ0FBUDtBQUVEO0FBRUQ7Ozs7O0FBR08sU0FBU08sVUFBVCxDQUFvQkMsS0FBcEIsRUFBa0NDLElBQWxDLEVBQXlEO0FBQzlELE1BQU1DLE1BQU0sR0FBRyxFQUFmO0FBQ0EsTUFBSUMsQ0FBQyxHQUFHLENBQVI7QUFDQSxNQUFJQyxDQUFDLEdBQUdKLEtBQUssQ0FBQ0ssTUFBZDs7QUFFQSxTQUFPRixDQUFDLEdBQUdDLENBQVgsRUFBYztBQUNaRixJQUFBQSxNQUFNLENBQUNJLElBQVAsQ0FBWU4sS0FBSyxDQUFDTyxLQUFOLENBQVlKLENBQVosRUFBZUEsQ0FBQyxJQUFJRixJQUFwQixDQUFaO0FBQ0Q7O0FBRUQsU0FBT0MsTUFBUDtBQUNEIiwic291cmNlc0NvbnRlbnQiOlsiXG4vKipcbiAqIEdldCB0aGUgbG93ZXIgb2YgdHdvIHZhbHVlcy5cbiAqIGlmIG1heWJlIGlzIHVuZGVmaW5lZCwgcmV0dXJuIHRoZSBsb3dlcnZhbHVlXG4gKiBcbiAqIEBwYXJhbSBtYXliZSBcbiAqIEBwYXJhbSBsb3dlclZhbHVlIFxuICovXG5leHBvcnQgZnVuY3Rpb24gc2FmZUxvd2VyKG1heWJlOiBudW1iZXIgfCB1bmRlZmluZWQgfCBudWxsLCBsb3dlclZhbHVlOiBudW1iZXIpOiBudW1iZXIge1xuICBpZiAoIW1heWJlKSB7XG4gICAgcmV0dXJuIGxvd2VyVmFsdWU7XG4gIH1cblxuICBpZiAobWF5YmUgPiBsb3dlclZhbHVlKSB7XG4gICAgcmV0dXJuIGxvd2VyVmFsdWU7XG4gIH1cblxuICByZXR1cm4gbWF5YmU7XG59XG5cbi8qKlxuICogU2FmdGVseSBnZXQgdGhpbmdzIGFuZCBjaGVjayBpZiBudWxsXG4gKiBcbiAqIEBleGFtcGxlOlxuICogICBjb25zdCB1c2VySWQgPSBnZXQocmVxLCBbJ3VzZXInLCAndWlkJ10pO1xuICovXG5leHBvcnQgZnVuY3Rpb24gc2FmZUdldE5lc3RlZChvOiBhbnksIHA6IHN0cmluZ1tdKSB7XG4gIHJldHVybiBwLnJlZHVjZSgoeHMsIHgpID0+XG4gICAgKHhzICYmIHhzW3hdKSA/IHhzW3hdIDogbnVsbCwgbyk7XG59XG5cbi8qKlxuICogU2FmdGVseSBnZXQgdGhpbmdzIGFuZCBjaGVjayBpZiBudWxsXG4gKiBcbiAqIEBleGFtcGxlOlxuICogICBjb25zdCB1c2VySWQgPSBnZXQocmVxLCBbJ3VzZXInLCAndWlkJ10pO1xuICovXG5leHBvcnQgZnVuY3Rpb24gc2FmZUdldE5lc3RlZERlZmF1bHQ8VD4obzogYW55LCBwOiBzdHJpbmdbXSwgYmFja3VwOiBUKSB7XG4gIHJldHVybiBwLnJlZHVjZSgoeHMsIHgpID0+XG4gICAgKHhzICYmIHhzW3hdKSA/IHhzW3hdIDogYmFja3VwLCBvKTtcbn1cblxuLyoqXG4gKiBTcGxpdCBhbiBhcnJheSB1cCBpbnRvIGFuIGFycmF5IG9mIGNodW5ja3NcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNodW5rQXJyYXkoYXJyYXk6IGFueVtdLCBzaXplOiBudW1iZXIpOiBhbnlbXVtdIHtcbiAgY29uc3QgY2h1bmtzID0gW107XG4gIGxldCBpID0gMDtcbiAgbGV0IG4gPSBhcnJheS5sZW5ndGg7XG5cbiAgd2hpbGUgKGkgPCBuKSB7XG4gICAgY2h1bmtzLnB1c2goYXJyYXkuc2xpY2UoaSwgaSArPSBzaXplKSk7XG4gIH1cblxuICByZXR1cm4gY2h1bmtzO1xufVxuXG4iXX0=