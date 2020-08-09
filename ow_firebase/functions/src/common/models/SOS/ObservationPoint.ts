import SerdeXML from './SerdeXML';
import { PointType } from './Point';
import * as handlebars from 'handlebars';


const Template =
`
<wml2:point>
  <wml2:MeasurementTVP>
    <wml2:time>{{time}}</wml2:time>
    <wml2:value>{{value}}</wml2:value>
  </wml2:MeasurementTVP>
</wml2:point>
`

export interface ObservationPointType {
  time: string, //iso string,
  value: string,
}

export default class ObservationPoint implements SerdeXML, ObservationPointType {
  time: string;
  value: string;


  constructor(init: ObservationPointType) {
    this.time = init.time;
    this.value = init.value;
  }

  serialize(): string {
    const template = (<any>handlebars).serialize(Template);
    return template(this);
  }
}
