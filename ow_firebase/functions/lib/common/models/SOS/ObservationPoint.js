"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const handlebars = require("handlebars");
const Template = `
<wml2:point>
  <wml2:MeasurementTVP>
    <wml2:time>{{time}}</wml2:time>
    <wml2:value>{{value}}</wml2:value>
  </wml2:MeasurementTVP>
</wml2:point>
`;
class ObservationPoint {
    constructor(init) {
        this.time = init.time;
        this.value = init.value;
    }
    serialize() {
        const template = handlebars.serialize(Template);
        return template(this);
    }
}
exports.default = ObservationPoint;
//# sourceMappingURL=ObservationPoint.js.map