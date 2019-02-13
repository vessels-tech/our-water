"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ResourceStationType_1 = require("ow_common/lib/enums/ResourceStationType");
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
            return ResourceStationType_1.default.well;
        case 'raingauge':
            return ResourceStationType_1.default.raingauge;
        case 'checkdam':
            return ResourceStationType_1.default.checkdam;
        case 'quality':
            return ResourceStationType_1.default.quality;
        default:
            throw new Error(`Unknown ResourceType conversion: ${type}`);
    }
};
//# sourceMappingURL=ResourceType.js.map