"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const handlebars = require("handlebars");
const GetFeatureOfInterestResponseTemplate = `
<sos:GetFeatureOfInterestResponse>{{{innerHTML}}}
</sos:GetFeatureOfInterestResponse>
`;
class GetFeatureOfInterestResponse {
    constructor(init) {
        this.id = init.id;
        this.exceptionReport = init.exceptionReport;
        this.fois = init.fois;
    }
    serialize() {
        // TODO: implement exception report
        //TODO: figure out how to next handlebars templates inside of this?
        const template = handlebars.compile(GetFeatureOfInterestResponseTemplate);
        const data = {
            innerHTML: this.fois.map(foi => foi.serialize()),
        };
        return template(data);
    }
}
exports.default = GetFeatureOfInterestResponse;
//# sourceMappingURL=GetFeatureOfInterestResponse.js.map