import FOI from './FOI';
import SerdeXML from './SerdeXML';
import * as handlebars from 'handlebars';

import GetCapabilitiesTemplate from './GetCapabilities.template';

export interface GetCapabilitiesResponseType {
  id: string;
  sosServiceUrl: string,

  //These are more like constants
  procedureUri: 'urn:ogc:object:Sensor::GIN_GroundwaterLevelProcess',
  observedPropertyUri: 'urn:ogc:def:phenomenon:OGC:1.0.30:groundwaterlevel',
  observableAreaLowerCorner: '12 12',
  observableAreaUpperCorner: '12 12',

}


export default class GetCapabilitiesResponse implements SerdeXML, GetCapabilitiesResponseType {
  id: string;
  sosServiceUrl: string;
  procedureUri: 'urn:ogc:object:Sensor::GIN_GroundwaterLevelProcess';
  observedPropertyUri: 'urn:ogc:def:phenomenon:OGC:1.0.30:groundwaterlevel';
  observableAreaLowerCorner: '12 12';
  observableAreaUpperCorner: '12 12';


  constructor(init: GetCapabilitiesResponseType) {
    this.id = init.id;
    this.sosServiceUrl = init.sosServiceUrl;
    this.procedureUri = init.procedureUri;
    this.observedPropertyUri = init.observedPropertyUri;
    this.observableAreaLowerCorner = init.observableAreaLowerCorner;
    this.observableAreaUpperCorner = init.observableAreaUpperCorner;
  }

  serialize(): string {
    const template = handlebars.compile(GetCapabilitiesTemplate);
    return template(this);
  }
}
