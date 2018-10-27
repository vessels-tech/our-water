import SerdeXML from './SerdeXML';
import * as handlebars from 'handlebars';

import GetObservationTemplate from './GetObservation.template';
import ObservationPoint from './ObservationPoint';


export interface GetObservationResponseType {
  id: string,
  // observedPropertyUri: 'urn:ogc:def:phenomenon:OGC:1.0.30:groundwaterlevel',
  observationPoints: ObservationPoint[],

}


export default class GetObservationResponse implements SerdeXML, GetObservationResponseType {
  id: string;
  // observedPropertyUri: 'urn:ogc:def:phenomenon:OGC:1.0.30:groundwaterlevel';
  observationPoints: ObservationPoint[];

  constructor(init: GetObservationResponseType) {
    this.id = init.id;
    this.observationPoints = init.observationPoints;
  }

  serialize(): string {
    const template = handlebars.compile(GetObservationTemplate);

    const data = {
      innerHTML: this.observationPoints.map(p => p.serialize()),
    }
    return template(this);
  }

}
