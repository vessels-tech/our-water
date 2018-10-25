import SerdeXML from './SerdeXML';
import { PointType } from './Point';

export default class FOI implements SerdeXML {
  id: string;
  description: string;
  gml_identifier: string;
  shape: PointType;



  serialize(): string {
    return 'FOI'
  }


  deserialize(xmlString: string): SerdeXML {
    return new FOI();
  }
}
