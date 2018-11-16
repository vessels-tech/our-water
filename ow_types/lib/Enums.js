"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.BaseApiType = exports.ResourceTypeArray = exports.ResourceType = void 0;

/**
 * Enums
 */
var ResourceType;
exports.ResourceType = ResourceType;

(function (ResourceType) {
  ResourceType["well"] = "well";
  ResourceType["raingauge"] = "raingauge";
  ResourceType["checkdam"] = "checkdam";
  ResourceType["quality"] = "quality";
  ResourceType["custom"] = "custom";
})(ResourceType || (exports.ResourceType = ResourceType = {}));

var ResourceTypeArray = Object.keys(ResourceType);
exports.ResourceTypeArray = ResourceTypeArray;
var BaseApiType;
exports.BaseApiType = BaseApiType;

(function (BaseApiType) {
  BaseApiType["MyWellApi"] = "MyWellApi";
  BaseApiType["GGMNApi"] = "GGMNApi";
})(BaseApiType || (exports.BaseApiType = BaseApiType = {}));

;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9FbnVtcy50cyJdLCJuYW1lcyI6WyJSZXNvdXJjZVR5cGUiLCJSZXNvdXJjZVR5cGVBcnJheSIsIk9iamVjdCIsImtleXMiLCJCYXNlQXBpVHlwZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUFBOzs7SUFJWUEsWTs7O1dBQUFBLFk7QUFBQUEsRUFBQUEsWTtBQUFBQSxFQUFBQSxZO0FBQUFBLEVBQUFBLFk7QUFBQUEsRUFBQUEsWTtBQUFBQSxFQUFBQSxZO0dBQUFBLFksNEJBQUFBLFk7O0FBUUwsSUFBTUMsaUJBQWdDLEdBQUdDLE1BQU0sQ0FBQ0MsSUFBUCxDQUFZSCxZQUFaLENBQXpDOztJQUdLSSxXOzs7V0FBQUEsVztBQUFBQSxFQUFBQSxXO0FBQUFBLEVBQUFBLFc7R0FBQUEsVywyQkFBQUEsVzs7QUFHWCIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogRW51bXNcbiAqL1xuXG5leHBvcnQgZW51bSBSZXNvdXJjZVR5cGUge1xuICB3ZWxsID0gJ3dlbGwnLFxuICByYWluZ2F1Z2UgPSAncmFpbmdhdWdlJyxcbiAgY2hlY2tkYW0gPSAnY2hlY2tkYW0nLFxuICBxdWFsaXR5ID0gJ3F1YWxpdHknLFxuICBjdXN0b20gPSAnY3VzdG9tJyxcbn1cblxuZXhwb3J0IGNvbnN0IFJlc291cmNlVHlwZUFycmF5OiBBcnJheTxzdHJpbmc+ID0gT2JqZWN0LmtleXMoUmVzb3VyY2VUeXBlKTtcblxuXG5leHBvcnQgZW51bSBCYXNlQXBpVHlwZSB7XG4gIE15V2VsbEFwaSA9ICdNeVdlbGxBcGknLFxuICBHR01OQXBpID0gJ0dHTU5BcGknLFxufTsiXX0=