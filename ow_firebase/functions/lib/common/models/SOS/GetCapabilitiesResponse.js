"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const handlebars = require("handlebars");
const GetCapabilities_template_1 = require("./GetCapabilities.template");
class GetCapabilitiesResponse {
    constructor(init) {
        this.id = init.id;
        this.sosServiceUrl = init.sosServiceUrl;
        this.procedureUri = init.procedureUri;
        this.observedPropertyUri = init.observedPropertyUri;
        this.observableAreaLowerCorner = init.observableAreaLowerCorner;
        this.observableAreaUpperCorner = init.observableAreaUpperCorner;
    }
    serialize() {
        const template = handlebars.compile(GetCapabilities_template_1.default);
        return template(this);
    }
}
exports.default = GetCapabilitiesResponse;
//# sourceMappingURL=GetCapabilitiesResponse.js.map