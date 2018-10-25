import FOI from './FOI';
import SerdeXML from './SerdeXML';

export default class GetFeatureOfInterestResponse implements SerdeXML {
  id: string;
  exceptionReport: any;
  fois: FOI[];

  constructor(fois: FOI[]) {
    this.fois = fois;
  }

  serialize(): string {
    // TODO: implement exception report
    // TODO: find easier way to build xml
    return `<sos:GetFeatureOfInterestResponse>
    ${this.fois.map(foi => foi.serialize())}
    </sos:GetFeatureOfInterestResponse>`
  }

  deserialize(xmlString: string): SerdeXML {
    const fois = [];
    //TODO: parse out fois
    return new GetFeatureOfInterestResponse(fois);
  }
}
