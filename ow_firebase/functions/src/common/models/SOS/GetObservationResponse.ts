import SerdeXML from './SerdeXML';
import * as handlebars from 'handlebars';

import GetObservationTemplate from './GetObservation.template';
import ObservationPoint from './ObservationPoint';


export interface GetObservationResponseType {
  id: string,
  observedPropertyUri: 'urn:ogc:def:phenomenon:OGC:1.0.30:groundwaterlevel',
  observationPoints: ObservationPoint[],
  startTime: string,
  endTime: string,
  responseTime: string,
  featureOfInterestId: string,
  measurementTimeseriesId: string,
  observationId: string,
  timePeriodId: string,

}


export default class GetObservationResponse implements SerdeXML, GetObservationResponseType {
  id: string;
  observedPropertyUri: 'urn:ogc:def:phenomenon:OGC:1.0.30:groundwaterlevel';
  observationPoints: ObservationPoint[];
  startTime: string;
  endTime: string;
  responseTime: string;
  featureOfInterestId: string;
  measurementTimeseriesId: string;
  observationId: string;
  timePeriodId: string;

  constructor(init: GetObservationResponseType) {
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

  serialize(): string {
    const template = handlebars.compile(GetObservationTemplate);

    const data = {
      innerHTML: this.observationPoints.map(p => p.serialize()),
    }
    return template(this);
  }

}
