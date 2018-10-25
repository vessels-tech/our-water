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
var GetFeatureOfInterestRequestFilterType;
(function (GetFeatureOfInterestRequestFilterType) {
    //only one implemented for now
    GetFeatureOfInterestRequestFilterType["spatialFilter"] = "spatialFilter";
    //Not yet implemented
    //TODO: these aren't really filters... 
    GetFeatureOfInterestRequestFilterType["procedure"] = "procedure";
    GetFeatureOfInterestRequestFilterType["observedProperty"] = "observedProperty";
    GetFeatureOfInterestRequestFilterType["featureOfInterest"] = "featureOfInterest";
})(GetFeatureOfInterestRequestFilterType = exports.GetFeatureOfInterestRequestFilterType || (exports.GetFeatureOfInterestRequestFilterType = {}));
//# sourceMappingURL=Types.js.map