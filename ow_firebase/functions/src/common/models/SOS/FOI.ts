import SerdeXML from './SerdeXML';
import { PointType } from './Point';
import * as handlebars from 'handlebars';

const FOITemplate = `
<sos:featureMember>
  <sams:SF_SpatialSamplingFeature gml:id="{{id}}">
    <gml:description>{{description}}</gml:description>
    <gml:identifier codeSpace="{{gml_identifier}}"></gml:identifier>
    <sf:type xlink:href="http://www.opengis.net/def/samplingFeatureType/OGC-OM/2.0/SF_SamplingPoint"/>
    <sf:sampledFeature xlink:href="urn:ogc:def:nil:OGC:unknown"/>
    <sams:shape>
      <gml:Point gml:id="{{shape.id}}">
      <gml:pos srsName="urn:ogc:def:crs:EPSG::4326">{{shape.position.lat}} {{shape.position.lng}}</gml:pos>
      </gml:Point>
    </sams:shape>
  </sams:SF_SpatialSamplingFeature>
</sos:featureMember>`

export interface FOIType {
  id: string;
  description: string;
  gml_identifier: string;
  shape: PointType;
}


export default class FOI implements SerdeXML, FOIType {
  //TODO: change to use types instead of classes
  id: string;
  description: string;
  gml_identifier: string;
  shape: PointType;

  constructor(init: FOIType) {
    this.id = init.id;
    this.description = init.description;
    this.gml_identifier = init.gml_identifier;
    this.shape = init.shape;
  }

  serialize(): string {
    const template = handlebars.compile(FOITemplate);

    return template(this);
  }
}
