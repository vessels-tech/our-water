"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const builder = require("xmlbuilder");
const Types_1 = require("../../fn_sos/Types");
const xmlbuilder = require("xmlbuilder");
const SOSApiBuilder_1 = require("../SOSApiBuilder");
const AppProviderTypes_1 = require("../types/AppProviderTypes");
const FirebaseApi_1 = require("./FirebaseApi");
const FOI_1 = require("../models/SOS/FOI");
const GetFeatureOfInterestResponse_1 = require("../models/SOS/GetFeatureOfInterestResponse");
/**
 *
 * TODO: use these to format your responses in xml:
 *  https://github.com/highsource/jsonix
 *  https://github.com/highsource/jsonix
 *
 */
class SOSApi {
    /**
     * @name handleRequest
     * @description Handle the basic request
     */
    static handleRequest(request) {
        //TODO: Maybe switch this out to an SOSRequest Object with different type
        switch (request.type) {
            case Types_1.SOSRequestType.GetFeatureOfInterest: {
                return this.getFeatureOfInterest(request);
            }
        }
        const res = { type: AppProviderTypes_1.ResultType.ERROR, message: 'Not implemented' };
        return Promise.resolve(res);
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
    static getCapabilities() {
        let node = xmlbuilder.begin().ele('sos:Capabilities', { version: '2.0.0', 'xsi:schemaLocation': "12345" });
        SOSApiBuilder_1.serviceIdentification(node, '', '');
        SOSApiBuilder_1.serviceProvider(node);
        SOSApiBuilder_1.operationsMetadata(node, [
            (innerNode) => SOSApiBuilder_1.operations(innerNode, 'GetCapabilities', [
                (i) => SOSApiBuilder_1.dcp(i),
                (i) => SOSApiBuilder_1.parameters(i, 'updateSequence', { type: SOSApiBuilder_1.ParameterType.ANY }),
                (i) => SOSApiBuilder_1.parameters(i, 'AcceptVersions', { type: SOSApiBuilder_1.ParameterType.MANY, values: ['2.0.0'] }),
                (i) => SOSApiBuilder_1.parameters(i, 'Sections', { type: SOSApiBuilder_1.ParameterType.MANY, values: [
                        'ServiceIdentification',
                        'ServiceProvider',
                        'OperationsMetadata',
                        'FilterCapabilities',
                        'Contents',
                        'All'
                    ] }),
                (i) => SOSApiBuilder_1.parameters(i, 'AcceptFormats', { type: SOSApiBuilder_1.ParameterType.MANY, values: [
                        'text/xml',
                        'application/zip'
                    ] })
            ]),
            (innerNode) => SOSApiBuilder_1.operations(innerNode, 'DescribeSensor', []),
            (innerNode) => SOSApiBuilder_1.operations(innerNode, 'GetObservation', []),
            (innerNode) => SOSApiBuilder_1.operations(innerNode, 'GetFeatureOfInterest', []),
            (innerNode) => SOSApiBuilder_1.parameters(innerNode, 'service', { type: SOSApiBuilder_1.ParameterType.MANY, values: ['SOS'] }),
            (innerNode) => SOSApiBuilder_1.parameters(innerNode, 'version', { type: SOSApiBuilder_1.ParameterType.MANY, values: ['2.0.0'] }),
        ]);
        SOSApiBuilder_1.filterCapabilities(node);
        SOSApiBuilder_1.contents(node);
        SOSApiBuilder_1.allowedValues(node, ['ServiceIdentification', 'ServiceProvider', 'OperationsMetadata', 'FilterCapabilities', 'Contents', 'All']);
        const parsed = node.end({ pretty: true });
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
    static describeSensor() {
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
    static getObservation() {
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
                                '@gml:id': 'ourwater_phenom_code',
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
                        '@gml:id': 'some_id',
                        'om:phenomenonTime': {
                            'gml:TimePeriod': {
                                // Param
                                '@gml:id': "go_1540419879602_ts",
                                // Param
                                'beginPosition': { '#text': '1995-01-28T17:00:00.000Z' },
                                // Param
                                'endPosition': { '#text': '1995-12-27T17:00:00.000Z' },
                            },
                        },
                        'om:resultTime': {
                            'gml:TimeInstant': {
                                // Param
                                '@gml:id': 'rs_time_1',
                                // Param
                                'gml:timePosition': { '#text': '2018-10-24T18:24:39.611-04:00' },
                            },
                        },
                        'procedure': {
                            '@xlink:href': "urn:ogc:object:feature:Sensor:gwprobe"
                        },
                        'om:observedProperty': {
                            '@xlink:href': "urn:ogc:def:phenomenon:OGC:1.0.30:groundwaterlevel",
                        },
                        'om:featureOfInterest': {
                            '@xlink:href': "http://ngwd-bdnes.cits.nrcan.gc.ca/Reference/uri-cgi/feature/gsc/waterwell/ca.ab.gov.wells.667",
                            '@xlink:title': "ca.ab.gov.wells.667",
                        },
                        'om:result': {
                            'wml2:MeasurementTimeSeries': {
                                '@gml:id': 'ts1',
                                'wml2:metadata': {
                                    'wml2:MeasurementTimeseriesMetadata': {
                                        // Param
                                        'wml2:temporalExtent': { '@xlink:href': '#go_1540419879602_ts' },
                                        'wml2:cumulative': { '#text': false },
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
    static getObservationById() {
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
    static getFeatureOfInterest(request) {
        return __awaiter(this, void 0, void 0, function* () {
            if (request.filter.type !== Types_1.GetFeatureOfInterestRequestFilterType.spatialFilter) {
                return {
                    type: AppProviderTypes_1.ResultType.ERROR,
                    message: 'only spatial filter is currently supported',
                };
            }
            // const orgId = 'ggmn'; //TODO: we need to get the orgId from the request params
            const orgId = 'mywell'; //TODO: we need to get the orgId from the request params
            /* Make the Firebase Api call */
            //TODO: we may need to edit this zoom value
            const result = yield FirebaseApi_1.default.resourcesNearLocation(orgId, request.filter.lat, request.filter.lng, request.filter.zoom);
            if (result.type === AppProviderTypes_1.ResultType.ERROR) {
                return result;
            }
            /* Convert from firebase Query to SOS Objects */
            const fois = result.result.map(r => FOI_1.default.fromResource(r));
            /*Serialize SOS Objects*/
            const foiResponse = {
                //TODO: not sure about this id
                id: '12345',
                fois,
                exceptionReport: 'exceptionreport?',
            };
            const response = new GetFeatureOfInterestResponse_1.default(foiResponse);
            const responseString = response.serialize();
            //build the response
            const res = { type: AppProviderTypes_1.ResultType.SUCCESS, result: responseString };
            return res;
        });
    }
}
exports.default = SOSApi;
//# sourceMappingURL=SOSApi.js.map