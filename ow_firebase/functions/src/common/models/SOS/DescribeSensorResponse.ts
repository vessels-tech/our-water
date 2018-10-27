import SerdeXML from './SerdeXML';
import * as handlebars from 'handlebars';

import DescribeSensorTemplate from './DescribeSensor.template';


export interface DescribeSensorResponseType {
  id: string,
  observedPropertyUri: 'urn:ogc:def:phenomenon:OGC:1.0.30:groundwaterlevel',

}


export default class DescribeSensorResponse implements SerdeXML, DescribeSensorResponseType {
  id: string;
  observedPropertyUri: 'urn:ogc:def:phenomenon:OGC:1.0.30:groundwaterlevel',

  constructor(init: DescribeSensorResponseType) {
    this.id = init.id;
  }

  serialize(): string {
    const template = handlebars.compile(DescribeSensorTemplate);
    return template(this);  
  }

}
