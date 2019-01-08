"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ResourceType;
(function (ResourceType) {
    ResourceType["Well"] = "well";
    ResourceType["Raingauge"] = "raingauge";
    ResourceType["Checkdam"] = "checkdam";
    // TODO: remove this! HAck for the front end to work
    ResourceType["well"] = "well";
    ResourceType["raingauge"] = "raingauge";
    ResourceType["checkdam"] = "checkdam";
})(ResourceType = exports.ResourceType || (exports.ResourceType = {}));
exports.resourceTypeFromString = (type) => {
    switch (type) {
        case 'well':
            return ResourceType.Well;
        case 'raingauge':
            return ResourceType.Raingauge;
        case 'checkdam':
            return ResourceType.Checkdam;
        default:
            throw new Error(`Unknown ResourceType conversion: ${type}`);
    }
};
//# sourceMappingURL=ResourceType.js.map