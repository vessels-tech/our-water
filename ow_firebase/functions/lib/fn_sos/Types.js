"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var SOSRequestType;
(function (SOSRequestType) {
    // SOS Core
    SOSRequestType["GetCapabilities"] = "GetCapabilities";
    SOSRequestType["DescribeSensor"] = "DescribeSensor";
    SOSRequestType["GetObservation"] = "GetObservation";
    //SOS Enhanced Operations Extension
    SOSRequestType["GetFeatureOfInterest"] = "GetFeatureOfInterest";
})(SOSRequestType = exports.SOSRequestType || (exports.SOSRequestType = {}));
var FilterType;
(function (FilterType) {
    //only one implemented for now
    FilterType["spatialFilter"] = "spatialFilter";
    FilterType["temporalFilter"] = "temporalFilter";
    FilterType["noFilter"] = "noFilter";
    // //Not yet implemented
    // //TODO: these aren't really filters... 
    // procedure="procedure",
    // observedProperty="observedProperty",
    // featureOfInterest="featureOfInterest",
})(FilterType = exports.FilterType || (exports.FilterType = {}));
//# sourceMappingURL=Types.js.map