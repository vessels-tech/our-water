"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const handlebars = require("handlebars");
const GetObservation_template_1 = require("./GetObservation.template");
class GetObservationResponse {
    constructor(init) {
        this.id = init.id;
        this.observationPoints = init.observationPoints;
        this.startTime = init.startTime;
        this.endTime = init.endTime;
        this.responseTime = init.responseTime;
        this.featureOfInterestId = init.featureOfInterestId;
        this.measurementTimeseriesId = init.measurementTimeseriesId;
        this.observationId = init.observationId;
        this.timePeriodId = init.timePeriodId;
    }
    serialize() {
        const template = handlebars.compile(GetObservation_template_1.default);
        const data = {
            innerHTML: this.observationPoints.map(p => p.serialize()),
        };
        return template(this);
    }
}
exports.default = GetObservationResponse;
//# sourceMappingURL=GetObservationResponse.js.map