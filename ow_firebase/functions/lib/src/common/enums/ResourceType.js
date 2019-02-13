"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var DepResourceType;
(function (DepResourceType) {
    DepResourceType["Well"] = "well";
    DepResourceType["Raingauge"] = "raingauge";
    DepResourceType["Checkdam"] = "checkdam";
    DepResourceType["Quality"] = "quality";
    // TODO: remove this! HAck for the front end to work
    DepResourceType["well"] = "well";
    DepResourceType["raingauge"] = "raingauge";
    DepResourceType["checkdam"] = "checkdam";
    DepResourceType["quality"] = "quality";
})(DepResourceType = exports.DepResourceType || (exports.DepResourceType = {}));
exports.resourceTypeFromString = (type) => {
    switch (type) {
        case 'well':
            return DepResourceType.Well;
        case 'raingauge':
            return DepResourceType.Raingauge;
        case 'checkdam':
            return DepResourceType.Checkdam;
        case 'quality':
            return DepResourceType.Quality;
        default:
            throw new Error(`Unknown ResourceType conversion: ${type}`);
    }
};
//# sourceMappingURL=ResourceType.js.map