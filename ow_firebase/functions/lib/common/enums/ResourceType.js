"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.resourceTypeFromString = exports.ResourceType = void 0;
var ResourceType;
exports.ResourceType = ResourceType;

(function (ResourceType) {
  ResourceType[ResourceType["Well"] = 'well'] = "Well";
  ResourceType[ResourceType["Raingauge"] = 'raingauge'] = "Raingauge";
  ResourceType[ResourceType["Checkdam"] = 'checkdam'] = "Checkdam";
})(ResourceType || (exports.ResourceType = ResourceType = {}));

var resourceTypeFromString = function resourceTypeFromString(type) {
  switch (type) {
    case 'well':
      return ResourceType.Well;

    case 'raingauge':
      return ResourceType.Raingauge;

    case 'checkdam':
      return ResourceType.Checkdam;

    default:
      throw new Error("Unknown ResourceType conversion: ".concat(type));
  }
};

exports.resourceTypeFromString = resourceTypeFromString;