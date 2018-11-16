"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "PendingReading", {
  enumerable: true,
  get: function get() {
    return _PendingReading.PendingReading;
  }
});
exports.Timeseries = exports.ShortId = exports.ResourceOwnerType = exports.Resource = exports.ReadingLocation = exports.ReadingImage = exports.Reading = exports.PendingTimeseries = exports.PendingResource = exports.OrgType = exports.GeoPoint = exports.GGMN = exports.Enums = void 0;

var Enums = _interopRequireWildcard(require("./Enums"));

exports.Enums = Enums;

var GGMN = _interopRequireWildcard(require("./GGMN"));

exports.GGMN = GGMN;

var GeoPoint = _interopRequireWildcard(require("./GeoPoint"));

exports.GeoPoint = GeoPoint;

var OrgType = _interopRequireWildcard(require("./OrgType"));

exports.OrgType = OrgType;

var _PendingReading = require("./PendingReading");

var PendingResource = _interopRequireWildcard(require("./PendingResource"));

exports.PendingResource = PendingResource;

var PendingTimeseries = _interopRequireWildcard(require("./PendingTimeseries"));

exports.PendingTimeseries = PendingTimeseries;

var Reading = _interopRequireWildcard(require("./Reading"));

exports.Reading = Reading;

var ReadingImage = _interopRequireWildcard(require("./ReadingImage"));

exports.ReadingImage = ReadingImage;

var ReadingLocation = _interopRequireWildcard(require("./ReadingLocation"));

exports.ReadingLocation = ReadingLocation;

var Resource = _interopRequireWildcard(require("./Resource"));

exports.Resource = Resource;

var ResourceOwnerType = _interopRequireWildcard(require("./ResourceOwnerType"));

exports.ResourceOwnerType = ResourceOwnerType;

var ShortId = _interopRequireWildcard(require("./ShortId"));

exports.ShortId = ShortId;

var Timeseries = _interopRequireWildcard(require("./Timeseries"));

exports.Timeseries = Timeseries;

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBQUE7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0EiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBFbnVtcyBmcm9tICcuL0VudW1zJztcbmltcG9ydCAqIGFzIEdHTU4gZnJvbSAnLi9HR01OJztcbmltcG9ydCAqIGFzIEdlb1BvaW50IGZyb20gJy4vR2VvUG9pbnQnO1xuaW1wb3J0ICogYXMgT3JnVHlwZSBmcm9tICcuL09yZ1R5cGUnO1xuaW1wb3J0IHsgUGVuZGluZ1JlYWRpbmcgfSBmcm9tICcuL1BlbmRpbmdSZWFkaW5nJztcbmltcG9ydCAqIGFzIFBlbmRpbmdSZXNvdXJjZSBmcm9tICcuL1BlbmRpbmdSZXNvdXJjZSc7XG5pbXBvcnQgKiBhcyBQZW5kaW5nVGltZXNlcmllcyBmcm9tICcuL1BlbmRpbmdUaW1lc2VyaWVzJztcbmltcG9ydCAqIGFzIFJlYWRpbmcgZnJvbSAnLi9SZWFkaW5nJztcbmltcG9ydCAqIGFzIFJlYWRpbmdJbWFnZSBmcm9tICcuL1JlYWRpbmdJbWFnZSc7XG5pbXBvcnQgKiBhcyBSZWFkaW5nTG9jYXRpb24gZnJvbSAnLi9SZWFkaW5nTG9jYXRpb24nO1xuaW1wb3J0ICogYXMgUmVzb3VyY2UgZnJvbSAnLi9SZXNvdXJjZSc7XG5pbXBvcnQgKiBhcyBSZXNvdXJjZU93bmVyVHlwZSBmcm9tICcuL1Jlc291cmNlT3duZXJUeXBlJztcbmltcG9ydCAqIGFzIFNob3J0SWQgZnJvbSAnLi9TaG9ydElkJztcbmltcG9ydCAqIGFzIFRpbWVzZXJpZXMgZnJvbSAnLi9UaW1lc2VyaWVzJztcblxuXG5leHBvcnQge1xuICBFbnVtcyxcbiAgR0dNTixcbiAgR2VvUG9pbnQsXG4gIE9yZ1R5cGUsXG4gIFBlbmRpbmdSZWFkaW5nLFxuICBQZW5kaW5nUmVzb3VyY2UsXG4gIFBlbmRpbmdUaW1lc2VyaWVzLFxuICBSZWFkaW5nLFxuICBSZWFkaW5nSW1hZ2UsXG4gIFJlYWRpbmdMb2NhdGlvbixcbiAgUmVzb3VyY2UsXG4gIFJlc291cmNlT3duZXJUeXBlLFxuICBTaG9ydElkLFxuICBUaW1lc2VyaWVzLFxufSJdfQ==