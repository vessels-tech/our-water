export enum SOSRequestType {
  // SOS Core
  GetCapabilities = 'GetCapabilities',
  DescribeSensor = 'DescribeSensor',
  GetObservation = 'GetObservation',

  //SOS Enhanced Operations Extension
  GetFeatureOfInterest = 'GetFeatureOfInterest',
} 

/* Add new request types here */
export type SOSRequest = GetFeatureOfInterestRequest;

//http://gin.gw-info.net/GinService/sos/gw?REQUEST=GetFeatureOfInterest&VERSION=2.0.0&SERVICE=SOS&spatialFilter=om:featureOfInterest/*/sams:shape,-116,50.5,-75,51.6,http://www.opengis.net/def/crs/EPSG/0/4326&namespaces=xmlns(sams,http://www.opengis.net/samplingSpatial/2.0),xmlns(om,http://www.opengis.net/om/2.0)

export type GetFeatureOfInterestRequest = {
  type: SOSRequestType.GetFeatureOfInterest,
  version: string, //should be 2.0.0
  service: string, //should be SOS
  filter: GetFeatureOfInterestRequestFilter
  orgId: string,
}

export enum GetFeatureOfInterestRequestFilterType {
  //only one implemented for now
  spatialFilter="spatialFilter",

  //Not yet implemented
  //TODO: these aren't really filters... 
  procedure="procedure",
  observedProperty="observedProperty",
  featureOfInterest="featureOfInterest",
}

//TODO: Add new filter types here
export type GetFeatureOfInterestRequestFilter = SpatialFilter;

//eg: om:featureOfInterest/*/sams:shape,-116,50.5,-75,51.6
export type SpatialFilter = {
  type: GetFeatureOfInterestRequestFilterType.spatialFilter,
  namespace: 'om:featureOfInterest/*/sams:shape',
  lat: number,
  lng: number,
  zoom: number,
}