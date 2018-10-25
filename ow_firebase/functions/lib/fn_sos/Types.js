"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SOSRequestType = void 0;
var SOSRequestType;
exports.SOSRequestType = SOSRequestType;

(function (SOSRequestType) {
  SOSRequestType[SOSRequestType["GetCapabilities"] = 'GetCapabilities'] = "GetCapabilities";
  SOSRequestType[SOSRequestType["DescribeSensor"] = 'DescribeSensor'] = "DescribeSensor";
  SOSRequestType[SOSRequestType["GetObservation"] = 'GetObservation'] = "GetObservation";
  SOSRequestType[SOSRequestType["GetFeatureOfInterest"] = 'GetFeatureOfInterest'] = "GetFeatureOfInterest";
})(SOSRequestType || (exports.SOSRequestType = SOSRequestType = {}));