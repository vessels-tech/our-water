const template = 
`<sos:GetObservationResponse xsi:schemaLocation="http://www.opengis.net/sos/2.0 http://schemas.opengis.net/sos/2.0/sosGetObservation.xsd" xmlns:wml2="http://www.opengis.net/waterml/2.0" xmlns:sa="http://www.opengis.net/sampling/2.0" xmlns:sf="http://www.opengis.net/sampling/2.0" xmlns:sa1="http://www.opengis.net/sampling/1.0" xmlns:sams="http://www.opengis.net/samplingSpatial/2.0" xmlns:swe="http://www.opengis.net/swe/2.0" xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns:swe1="http://www.opengis.net/swe/1.0.1" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:gml="http://www.opengis.net/gml/3.2" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:om="http://www.opengis.net/om/2.0" xmlns:sos="http://www.opengis.net/sos/2.0" xmlns:gml31="http://www.opengis.net/gml" xmlns:om1="http://www.opengis.net/om/1.0" xmlns:fn="http://www.w3.org/2005/xpath-functions">
	<swe:extension>
		<wml2:SOSProfileExtension>
			<wml2:metadata>
				<wml2:DocumentMetadata gml:id="ow.DocMd.1">
					<wml2:generationData>2018-10-27T07:08:15.242-04:00</wml2:generationData>
					<wml2:generationSystem>OurWater Metadata</wml2:generationSystem>
				</wml2:DocumentMetadata>
			</wml2:metadata>
			<wml2:phenomenaDictionary>
				<gml:Dictionary gml:id="GIN_Phenom_code">
					<gml:identifier codeSpace="http://geoscience.data.gc.ca/id/names">
						phenom_codes_dict
					</gml:identifier>
					<gml:dictionaryEntry>
						<gml:Definition gml:id="groundwater_level">
							<gml:identifier codeSpace="http://geoscience.data.gc.ca/id/phenomenon">urn:ogc:def:phenomenon:OGC:1.0.30:groundwaterlevel</gml:identifier>
							<gml:name codeSpace="http://geoscience.data.gc.ca/id/phenomenon">Groundwater level in well, in meter above mean sea level</gml:name>
							<gml:remarks>The measure is usually calculated using the depth of water level substracted from the elevation of the well head.</gml:remarks>
						</gml:Definition>
					</gml:dictionaryEntry>
				</gml:Dictionary>
			</wml2:phenomenaDictionary>
		</wml2:SOSProfileExtension>
	</swe:extension>
  <sos:observationData>
    <om:OM_Observation gml:id="{{observationId}}">
			<om:phenomenonTime>
				<gml:TimePeriod gml:id="{timePeriodId}">
					<beginPosition xmlns="http://www.opengis.net/gml/3.2">{{startTime}}</beginPosition>
					<endPosition xmlns="http://www.opengis.net/gml/3.2">{{endTime}}</endPosition>
				</gml:TimePeriod>
			</om:phenomenonTime>
			<om:resultTime>
				<gml:TimeInstant gml:id="rs_time_1">
					<gml:timePosition>{{responseTime}}</gml:timePosition>
				</gml:TimeInstant>
			</om:resultTime>
			<procedure xlink:href="urn:ogc:object:feature:Sensor:gwprobe" xmlns="http://www.opengis.net/om/2.0"></procedure>
			<om:observedProperty xlink:href="{{observedPropertyUri}}"></om:observedProperty>
			<om:featureOfInterest xlink:href="http://ngwd-bdnes.cits.nrcan.gc.ca/Reference/uri-cgi/feature/gsc/waterwell/ca.ab.gov.wells.667" xlink:title="{{featureOfInterestId}}"></om:featureOfInterest>
			<om:result>
			<wml2:MeasurementTimeSeries gml:id="{{measurementTimeseriesId}}">
			<wml2:metadata>
				<wml2:MeasurementTimeseriesMetadata>
					<wml2:temporalExtent xlink:href="#{timePeriodId}"></wml2:temporalExtent>
					<wml2:cumulative>false</wml2:cumulative>
				</wml2:MeasurementTimeseriesMetadata>
			</wml2:metadata>
			<wml2:defaultPointMetadata>
				<wml2:DefaultTVPMeasurementMetadata>
					<wml2:uom code=" m " xlink:href="http://www.opengis.net/def/uom/UCUM/0/m" xlink:title="m above sea level"></wml2:uom>
				</wml2:DefaultTVPMeasurementMetadata>
			</wml2:defaultPointMetadata>
				{{{pointHTML}}}
				</wml2:MeasurementTimeSeries>
			</om:result>
		</om:OM_Observation>
  </sos:observationData>
</sos:GetObservationResponse>`

export default template;