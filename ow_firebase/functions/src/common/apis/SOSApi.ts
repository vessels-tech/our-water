import * as builder from 'xmlbuilder';
import { SOSRequestType, SOSRequest, GetFeatureOfInterestRequest, FilterType, GetCapabilitiesRequest, DescribeSensorRequest, GetObservationRequest } from "../../fn_sos/Types";
import xmlbuilder = require('xmlbuilder');
import { allowedValues, serviceIdentification, serviceProvider, operationsMetadata, filterCapabilities, contents, operations, parameters, dcp, ParameterType, Point } from '../SOSApiBuilder';
import { SomeResult, ResultType, SuccessResult } from '../types/AppProviderTypes';
import FirebaseApi from './FirebaseApi';
import FOI from '../models/SOS/FOI';
import GetFeatureOfInterestResponse, { GetFeatureOfInterestResponseType } from '../models/SOS/GetFeatureOfInterestResponse';


/**
 * 
 * TODO: use these to format your responses in xml:
 *  https://github.com/highsource/jsonix
 * 
 */

export default class SOSApi {


  /**
   * @name handleRequest
   * @description Handle the basic request
   */
  public static handleRequest(request: SOSRequest): Promise<SomeResult<string>> {
    switch (request.type) {
      case SOSRequestType.GetCapabilities: return this.getCapabilities(request);
      case SOSRequestType.DescribeSensor: return this.describeSensor(request);
      case SOSRequestType.GetObservation: return this.getObservation(request);
      case SOSRequestType.GetFeatureOfInterest: return this.getFeatureOfInterest(request);
      default: {
        const _exhaustiveMatch = request;
        throw new Error(`Non-exhausive match for path: ${_exhaustiveMatch}`);
      }
    }
  }

  //
  // Core API
  //---------------------------------

  /**
   * @name GetCapabilities
   * 
   * Provides access to metadata and detailed information about the operations 
   * available by an SOS server.
   * 
   * eg: http://schemas.opengis.net/sos/2.0/examples/core/GetCapabilities1_response.xml
   */
  static getCapabilities(request: GetCapabilitiesRequest): Promise<SomeResult<string>> {
    return Promise.resolve(null);
  }

  /**
   * @name DescribeSensor
   * 
   * @summary Enables querying of metadata about the sensors and sensor systems available by an SOS server.
   * 
   * @example
   * eg: http://schemas.opengis.net/sos/2.0/examples/core/DescribeSensor1.xml
   * 
   * 
   * Thoughts
   */
  static describeSensor(request: DescribeSensorRequest): Promise<SomeResult<string>> {
    return Promise.resolve(null);
  }

  /**
   * @name GetObservation 
   * 
   * @summary Provides access to observations by allowing spatial, temporal and thematic filtering.
   * 
   * @example
   * - http://schemas.opengis.net/sos/2.0/examples/core/GetObservation1_obsProps.xml
   * - http://schemas.opengis.net/sos/2.0/examples/core/GetObservation2_obsProps_Procedure.xml
   * 
   * 
   * Params? 
   *  - offering
   *  - featureOfInterest
   *  - observedProperty
   *  - phenomenon
   */
  static getObservation(request: GetObservationRequest): Promise<SomeResult<string>> {

    return Promise.resolve(null);

  }

  //
  // Enhanced Operations Extension API
  //---------------------------------

  /**
   * @name GetObservationByID
   * 
   * @summary Provides access to observations from an SOS by passing only the ID of an observation.
   * 
   * 
   */
  static getObservationById(): string {
    throw new Error("getObservationById Not Implemented");
  }


  /**
   * GetFeatureOfInterest
   * 
   * provides direct access to the features of interest for which the 
   * SOS offers observations.
   * 
   * I think this is the endpoint used to serve multiple wells at a time.
   * Looks like there is no pagination or rate liming on this endpoint.
   * 
   * We will need to include some metadata to make sure these end up in the correct
   * organizations
   * 
   * 
  * <sams:SF_SpatialSamplingFeature gml:id="ab.mon.654"> becomes the Id of the gw station
   * 
   */
//eg: http://gin.gw-info.net/GinService/sos/gw?REQUEST=GetFeatureOfInterest&VERSION=2.0.0&SERVICE=SOS&spatialFilter=om:featureOfInterest/*/sams: shape,-116, 50.5, -75, 1.6, http://www.opengis.net/def/crs/EPSG/0/4326&namespaces=xmlns(sams,http://www.opengis.net/samplingSpatial/2.0),xmlns(om,http://www.opengis.net/om/2.0)

  static async getFeatureOfInterest(request: GetFeatureOfInterestRequest): Promise<SomeResult<string>> {

    /* Make the Firebase Api call */
    //TODO: we may need to edit this zoom value
    let result;
    if (request.filter.type === FilterType.noFilter) {
      //TODO: implement FirebaseAp call for all resources
      // return the latest 100 only.
      result = { type: ResultType.ERROR, message: 'TODO: implement no filter resources'};
    } else {
      result = await FirebaseApi.resourcesNearLocation(request.orgId, request.filter.lat, request.filter.lng, request.filter.zoom);
    }
    if (result.type === ResultType.ERROR) {
      return result;
    }

    /* Convert from firebase Query to SOS Objects */
    const fois: FOI[] = result.result.map(r => FOI.fromResource(r));
    
    /* Serialize SOS Objects*/
    const foiResponse: GetFeatureOfInterestResponseType = {
      //TODO: not sure about this id
      id: '12345',
      fois,
      exceptionReport: 'exceptionreport?',
    }
    const response = new GetFeatureOfInterestResponse(foiResponse);
    const responseString = response.serialize();

    //build the response
    const res: SomeResult<string> = { type: ResultType.SUCCESS, result: responseString};
    return res;
  }
}