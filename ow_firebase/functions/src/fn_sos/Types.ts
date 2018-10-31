export enum SOSRequestType {
  // SOS Core
  GetCapabilities = 'GetCapabilities',
  DescribeSensor = 'DescribeSensor',
  GetObservation = 'GetObservation',

  //SOS Enhanced Operations Extension
  GetFeatureOfInterest = 'GetFeatureOfInterest',
} 

/* Add new request types here */
export type SOSRequest = GetCapabilitiesRequest | DescribeSensorRequest | GetObservationRequest | GetFeatureOfInterestRequest;

//http://gin.gw-info.net/GinService/sos/gw?REQUEST=GetCapabilities&ACCEPTVERSIONS=2.0.0,1.0.0&SERVICE=SOS
export type GetCapabilitiesRequest = {
  type: SOSRequestType.GetCapabilities,
  version: '2.0.0', //should be 2.0.0
  service: 'SOS',
  orgId: string,
}

//eg: 
//http://gin.gw-info.net/GinService/sos/gw?REQUEST=DescribeSensor&VERSION=2.0.0&SERVICE=SOS&procedure=urn:ogc:object:Sensor::GIN_GroundwaterLevelProcess&procedurDescriptionFormat=http://www.opengis.net/sensorML/1.0.1 
export type DescribeSensorRequest = {
  type: SOSRequestType.DescribeSensor,
  version: '2.0.0', //should be 2.0.0
  service: 'SOS',
  orgId: string,
  procedure: 'urn:ogc:object:Sensor::GIN_GroundwaterLevelProcess', //todo: define our own
  procedureDescriptionFormat: 'http://www.opengis.net/sensorML/1.0.1',
}

//eg:
//http://gin.gw-info.net/GinService/sos/gw?REQUEST=GetObservation&VERSION=2.0.0&SERVICE=SOS&offering=GW_LEVEL&featureOfInterest=ab.mon.667&observedProperty=urn:ogc:def:phenomenon:OGC:1.0.30:groundwaterlevel
//http://gin.gw-info.net/GinService/sos/gw?REQUEST=GetObservation&VERSION=2.0.0&SERVICE=SOS&offering=GW_LEVEL&featureOfInterest=ab.mon.667&observedProperty=urn:ogc:def:phenomenon:OGC:1.0.30:groundwaterlevel&temporalFilter=om:phenomenonTime,1995-01-01T00:00:00Z/1996-01-01T00:00:00Z&&namespaces=xmlns(om,http://www.opengis.net/om/2.0)
export type GetObservationRequest = {
  type: SOSRequestType.GetObservation,
  version: '2.0.0', //should be 2.0.0
  service: 'SOS',
  orgId: string,
  offering: 'GW_LEVEL',
  featureOfInterest: string, //TODO: I think this is the resourceId
  observedProperty: 'urn:ogc:def:phenomenon:OGC:1.0.30:groundwaterlevel',
  filter: AnyFilter,
}


//http://gin.gw-info.net/GinService/sos/gw?REQUEST=GetFeatureOfInterest&VERSION=2.0.0&SERVICE=SOS&spatialFilter=om:featureOfInterest/*/sams:shape,-116,50.5,-75,51.6,http://www.opengis.net/def/crs/EPSG/0/4326&namespaces=xmlns(sams,http://www.opengis.net/samplingSpatial/2.0),xmlns(om,http://www.opengis.net/om/2.0)
export type GetFeatureOfInterestRequest = {
  type: SOSRequestType.GetFeatureOfInterest,
  version: '2.0.0', //should be 2.0.0
  service: 'SOS',
  filter: SpatialFilter | NoFilter,
  orgId: string,
}

export enum FilterType {
  //only one implemented for now
  spatialFilter="spatialFilter",
  temporalFilter='temporalFilter',
  noFilter="noFilter",

  

  // //Not yet implemented
  // //TODO: these aren't really filters... 
  // procedure="procedure",
  // observedProperty="observedProperty",
  // featureOfInterest="featureOfInterest",
}

//TODO: Add new filter types here
export type AnyFilter = SpatialFilter | TemporalFilter | NoFilter;

//eg: om:featureOfInterest/*/sams:shape,-116,50.5,-75,51.6
export type SpatialFilter = {
  type: FilterType.spatialFilter,
  namespace: 'om:featureOfInterest/*/sams:shape',
  lat: number,
  lng: number,
  zoom: number,
}


export type TemporalFilter = {
  type: FilterType.temporalFilter,
  namespace: 'xmlns(om,http://www.opengis.net/om/2.0)',
  timeFilterType: 'om:phenomenonTime', 
  startTime: string, //ISO Format
  endTime: string, //ISO Format
}

/* Describes exactly no filter - Look mum, no nulls! */
export type NoFilter = {
  type: FilterType.noFilter,
}
