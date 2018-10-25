"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Types = require("../../fn_sos/Types");

var _XmlBuilder = require("../../fn_sos/XmlBuilder");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/**
 * 
 * TODO: use these to format your responses in xml:
 *  https://github.com/highsource/jsonix
 *  https://github.com/highsource/jsonix
 * 
 */
var SOSApi =
/*#__PURE__*/
function () {
  function SOSApi() {
    _classCallCheck(this, SOSApi);
  }

  _createClass(SOSApi, null, [{
    key: "handleRequest",

    /**
     * @name handleRequest
     * @description Handle the basic request
     */
    value: function handleRequest(type) {
      //TODO: Maybe switch this out to an SOSRequest Object with different type
      switch (type) {
        case _Types.SOSRequestType.GetCapabilities:
          {
            return this.getCapabilities();
          }
      }

      return '';
    } //
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

  }, {
    key: "getCapabilities",
    value: function getCapabilities() {
      console.log((0, _XmlBuilder.testTsx)());
      return ""; // const xml = builder.create('sos:Capabilities', { version: '2.0.0', 'xsi:schemaLocation': "http://www.opengis.net/sos/2.0 http://schemas.opengis.net/sos/2.0/sos.xsd"})
      //   .ele('xmlbuilder')
      //     .ele('repo', { 'type': 'git' }, 'git://github.com/oozcitak/xmlbuilder-js.git')
      //   .end({pretty: true});
      // const root = xmlbuilder.begin()
      // .ele('sos:Capabilities', { version: '2.0.0', 'xsi:schemaLocation': "http://www.opengis.net/sos/2.0 http://schemas.opengis.net/sos/2.0/sos.xsd" })
      //   .ele('ows:ServiceIdentification')
      //     .ele('ows:Title', {}, 'OurWater SOS').up()
      //     .ele('ows:Abstract', {}, 'TODO: insert abstract').up()
      //     .ele('ows:Keywords').up()
      //     .ele('ows:ServiceType', { codeSpace: 'http://opengeospatial.net' }, 'OGC:SOS').up()
      //     .ele('ows:ServiceTypeVersion', {}, '2.0.0').up()
      //     //TODO: finish later
      //   .up()
      //   .ele('ows:ServiceProvider')
      //     .ele('ows:ProviderName', {}, 'OurWater, from Vessels Tech').up()
      //     .ele('ows:ProviderSite', {'xlink:href':'https://vesselstech.com'}).up()
      //     .ele('ows:ServiceContact').up()
      //   .up()
      // .ele('ows:OperationsMetadata')
      //   .ele('ows:Operation', {name: 'GetCapabilities'})
      //     .ele('ows:DCP')
      //       .ele('ows:HTTP')
      //         .ele('ows:Get', { 'xlink:href':"http://gin.gw-info.net/GinService/sos/gw?"}).up()
      //         // Are we supporting post?
      //         .ele('ows:Post', { 'xlink:href':"http://gin.gw-info.net/GinService/sos/gw?"}).up()
      //       .up()
      //     .up()
      //     .ele('ows:Parameter', {name:'updateSequence'})
      //       .ele('ows:AnyValue').up()
      //     .up()
      //     .ele('ows:Parameter', {name:'AcceptVersions'})
      //       .ele('ows:AllowedValues')
      //         .ele('ows:Value', {}, '2.0.0').up()
      //       .up()
      //     .up()
      //     .ele('ows:Parameter', {name:'Sections'})
      //       .ele('ows:AllowedValues')
      //         .ele('ows:Value', {}, 'ServiceIdentification').up()
      //         .ele('ows:Value', {}, 'ServiceProvider').up()
      //         .ele('ows:Value', {}, 'OperationsMetadata').up()
      //         .ele('ows:Value', {}, 'FilterCapabilities').up()
      //         .ele('ows:Value', {}, 'Contents').up()
      //         .ele('ows:Value', {}, 'All').up()
      //       .up()
      //     .up()
      //     .ele('ows:Parameter', {name:'AcceptFormats'})
      //       .ele('ows:AllowedValues')
      //         .ele('ows:Value', {}, 'text/xml').up()
      //         .ele('ows:Value', {}, 'application/zip').up()
      //         // TODO: we should support application/json
      //       .up()
      //     .up()
      //   .up()
      // .up()
      //   .ele('sos:filterCapabilities')
      //   .up()
      //   .ele('sos:contents')
      //   .up()
      // return root.end({ pretty: true })
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

  }, {
    key: "describeSensor",
    value: function describeSensor() {
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

  }, {
    key: "getObservation",
    value: function getObservation() {
      return '';
    } //
    // Enhanced Operations Extension API
    //---------------------------------

    /**
     * @name GetObservationByID
     * 
     * @summary Provides access to observations from an SOS by passing only the ID of an observation.
     * 
     * 
     */

  }, {
    key: "getObservationById",
    value: function getObservationById() {
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

  }, {
    key: "getFeatureOfInterest",
    value: function getFeatureOfInterest() {
      return '';
    }
  }]);

  return SOSApi;
}();

exports.default = SOSApi;