const template = 
`<?xml version="1.0" encoding="UTF-8"?>
<sml:ProcessModel xsi:schemaLocation="http://www.opengis.net/sensorML/1.0.1 http://schemas.opengis.net/sensorML/1.0.1/process.xsd" xmlns:sml="http://www.opengis.net/sensorML/1.0.1" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:gml="http://www.opengis.net/gml" xmlns:swe="http://www.opengis.net/swe/1.0.1" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
	<gml:description>Groundwater level measurement at a monitoring station (Observation well)</gml:description>
	<gml:name>Groundwater Level Monitoring</gml:name>
	<sml:identification>
		<sml:IdentifierList>
			<sml:identifier>
				<sml:Term>
					<sml:value>urn:ogc:object:Sensor::GIN_GroundwaterLevelProcess</sml:value>
				</sml:Term>
			</sml:identifier>
		</sml:IdentifierList>
	</sml:identification>
	<sml:inputs>
		<sml:InputList>
			<sml:input name="pressure">
				<swe:DataRecord>
					<swe:field name="groundwater pressure">
						<swe:Quantity definition="urn:ogc:def:property:OGC:waterPressure"></swe:Quantity>
					</swe:field>
				</swe:DataRecord>
			</sml:input>
		</sml:InputList>
	</sml:inputs>
	<sml:outputs>
		<sml:OutputList>
			<sml:output name="grounwaterLevel">
				<swe:Quantity definition="{{observedPropertyUri}}"></swe:Quantity>
			</sml:output>
		</sml:OutputList>
	</sml:outputs>
	<!-- requirement gml-nil:req/GMLDataNillable (OGC 12-110) -->
	<sml:method xlink:href="http://www.opengis.net/def/nil/OGC/0/unknown"></sml:method>
</sml:ProcessModel>`

export default template;