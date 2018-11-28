"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const handlebars = require("handlebars");
const DescribeSensor_template_1 = require("./DescribeSensor.template");
class DescribeSensorResponse {
    constructor(init) {
        this.id = init.id;
    }
    serialize() {
        const template = handlebars.compile(DescribeSensor_template_1.default);
        return template(this);
    }
}
exports.default = DescribeSensorResponse;
//# sourceMappingURL=DescribeSensorResponse.js.map