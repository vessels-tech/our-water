"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ResourceType;
(function (ResourceType) {
    ResourceType["Well"] = "well";
    ResourceType["Raingauge"] = "raingauge";
    ResourceType["Checkdam"] = "checkdam";
    ResourceType["Quality"] = "quality";
    // TODO: remove this! HAck for the front end to work
    ResourceType["well"] = "well";
    ResourceType["raingauge"] = "raingauge";
    ResourceType["checkdam"] = "checkdam";
    ResourceType["quality"] = "quality";
})(ResourceType = exports.ResourceType || (exports.ResourceType = {}));
exports.resourceTypeFromString = (type) => {
    switch (type) {
        case 'well':
            return ResourceType.Well;
        case 'raingauge':
            return ResourceType.Raingauge;
        case 'checkdam':
            return ResourceType.Checkdam;
        case 'quality':
            return ResourceType.Quality;
        default:
            throw new Error(`Unknown ResourceType conversion: ${type}`);
    }
};
//# sourceMappingURL=ResourceType.js.map