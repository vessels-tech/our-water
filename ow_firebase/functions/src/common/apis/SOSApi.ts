import * as builder from 'xmlbuilder';
import { SOSRequestType } from "../../fn_sos/Types";
import {testTsx } from '../../fn_sos/XmlBuilder';
import xmlbuilder = require('xmlbuilder');
import { allowedValues, serviceIdentification, serviceProvider, operationsMetadata, filterCapabilities, contents, operations, parameters, dcp, ParameterType, Point } from '../SOSApiBuilder';


/**
 * 
 * TODO: use these to format your responses in xml:
 *  https://github.com/highsource/jsonix
 *  https://github.com/highsource/jsonix
 * 
 */

export default class SOSApi {



  /**
   * @name handleRequest
   * @description Handle the basic request
   */
  public static handleRequest(type: SOSRequestType): string {
    //TODO: Maybe switch this out to an SOSRequest Object with different type
    switch (type) {
      case SOSRequestType.GetCapabilities: {
        return this.getCapabilities();
      }
    }

    return '';
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
  static getCapabilities(): string {

    let node = xmlbuilder.begin().ele('sos:Capabilities', { version: '2.0.0', 'xsi:schemaLocation': "12345" });
    serviceIdentification(node, '', '');
    serviceProvider(node);
    operationsMetadata(node, [
      (innerNode) => operations(innerNode, 'GetCapabilities', [
        (i) => dcp(i),
        (i) => parameters(i, 'updateSequence', { type: ParameterType.ANY }),
        (i) => parameters(i, 'AcceptVersions', { type: ParameterType.MANY, values: ['2.0.0']}),
        (i) => parameters(i, 'Sections', { type: ParameterType.MANY, values: [
          'ServiceIdentification',
          'ServiceProvider',
          'OperationsMetadata',
          'FilterCapabilities',
          'Contents',
          'All'
        ]}),
        (i) => parameters(i, 'AcceptFormats', { type: ParameterType.MANY, values: [
          'text/xml',
          'application/zip'
        ]})
      ]),
      (innerNode) => operations(innerNode, 'DescribeSensor', []),
      (innerNode) => operations(innerNode, 'GetObservation', []),
      (innerNode) => operations(innerNode, 'GetFeatureOfInterest', []),
      (innerNode) => parameters(innerNode, 'service', {type: ParameterType.MANY, values: ['SOS']}),
      (innerNode) => parameters(innerNode, 'version', {type: ParameterType.MANY, values: ['2.0.0']}),
    ]);
    filterCapabilities(node);
    contents(node);
    allowedValues(node, ['ServiceIdentification', 'ServiceProvider', 'OperationsMetadata','FilterCapabilities', 'Contents','All']);


    const parsed = node.end({pretty: true});
    return parsed;
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
  static describeSensor(): string {
    return '';
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
  static getObservation(): string {

    //The following is the implementation copied from: 
    // http://gin.gw-info.net/GinService/sos/gw?REQUEST=GetObservation&VERSION=2.0.0&SERVICE=SOS&offering=GW_LEVEL&featureOfInterest=ab.mon.667&observedProperty=urn:ogc:def:phenomenon:OGC:1.0.30:groundwaterlevel&temporalFilter=om:phenomenonTime,1995-01-01T00:00:00Z/1996-01-01T00:00:00Z&&namespaces=xmlns(om,http://www.opengis.net/om/2.0)
    //Which I suppose is a request for id: ab.mon.667, looking at groundwater, with a time filter
    const node = builder.create({
      'sos:GetObservationResponse': {
        '@xsi:schemaLocation': "http://www.opengis.net/sos/2.0 http://schemas.opengis.net/sos/2.0/sosGetObservation.xsd",
        'swe:extension': {
          'wml2:SOSProfileExtension': {
            'wml2:metadata': {
              'wml2:DocumentMetadata': {
                // Param
                '@gml:id': 'com.ourwater.docmd.1'
              }
            },
            'wml2:phenomenaDictionary': {
              'gml:Dictionary': {
                // Pararm
                '@gml:id':'ourwater_phenom_code',
                'gml:identifier': {
                  '@codeSpace': 'http://geoscience.data.gc.ca/id/names',
                  "#text": 'phenom_codes_dict'
                }
              }
            }
          }
        },
        'sos:observationData': {
          'om:OM_Observation': {
            // Param
            '@gml:id':'some_id',
            'om:phenomenonTime': {
              'gml:TimePeriod': {
                // Param
                '@gml:id': "go_1540419879602_ts",
                // Param
                'beginPosition': { '#text': '1995-01-28T17:00:00.000Z'},
                // Param
                'endPosition': { '#text': '1995-12-27T17:00:00.000Z'},
              },
            },
            'om:resultTime': {
              'gml:TimeInstant': {
                // Param
                '@gml:id':'rs_time_1',
                // Param
                'gml:timePosition': { '#text': '2018-10-24T18:24:39.611-04:00'},
              },
            },
            'procedure': {
              '@xlink:href': "urn:ogc:object:feature:Sensor:gwprobe"
            },
            'om:observedProperty' : {
              '@xlink:href': "urn:ogc:def:phenomenon:OGC:1.0.30:groundwaterlevel",
            },
            'om:featureOfInterest' : {
              '@xlink:href': "http://ngwd-bdnes.cits.nrcan.gc.ca/Reference/uri-cgi/feature/gsc/waterwell/ca.ab.gov.wells.667",
              '@xlink:title': "ca.ab.gov.wells.667",
            },
            'om:result': {
              'wml2:MeasurementTimeSeries': {
                '@gml:id': 'ts1',
                'wml2:metadata': {
                  'wml2:MeasurementTimeseriesMetadata': {
                    // Param
                    'wml2:temporalExtent': { '@xlink:href': '#go_1540419879602_ts'},
                    'wml2:cumulative': { '#text': false},
                  }
                },
                'wml2:defaultPointMetadata': {
                  'wml2:DefaultTVPMeasurementMetadata': {
                    'wml2:uom': {
                      '@code': ' m ',
                      '@xlink:href': 'http://www.opengis.net/def/uom/UCUM/0/m',
                      '@xlink:title': ' m above sea level',
                    }
                  }
                },
                // TODO: Load these points dynamically
                'wml2:point': {
                  'wml2:MeasurementTVP': {
                    'wml2:time': '1995-01-28T17:00:00.000Z',
                    'wml2:value': 1043.42,
                  }
                },
                //TODO: this wont work - the dict type won't allow us to have duplicates!
                'wml2:point': {
                  'wml2:MeasurementTVP': {
                    'wml2:time': '1995-01-28T17:00:00.000Z',
                    'wml2:value': 1043.42,
                  }
                },
                ...Point('1995-01-28T17:00:00.000Z', 12220),
                ...Point('1995-01-28T17:00:00.000Z', 12221),
              }
            }
          }
        },
      }
    });

    return node.end({ pretty: true });
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

  static getFeatureOfInterest(): string {
    return '';
  }


}