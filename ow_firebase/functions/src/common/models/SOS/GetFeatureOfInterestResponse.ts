import FOI from './FOI';
import SerdeXML from './SerdeXML';
import * as handlebars from 'handlebars';

const GetFeatureOfInterestResponseTemplate = `
<sos:GetFeatureOfInterestResponse>{{{innerHTML}}}
</sos:GetFeatureOfInterestResponse>
`

export interface GetFeatureOfInterestResponseType {
  id: string;
  exceptionReport: any;
  fois: FOI[];
}


export default class GetFeatureOfInterestResponse implements SerdeXML, GetFeatureOfInterestResponseType {
  id: string;
  exceptionReport: any;
  fois: FOI[];

  constructor(init: GetFeatureOfInterestResponseType) {
    this.id = init.id;
    this.exceptionReport = init.exceptionReport;
    this.fois = init.fois;
  }

  serialize(): string {
    // TODO: implement exception report
    //TODO: figure out how to next handlebars templates inside of this?
    const template = handlebars.compile(GetFeatureOfInterestResponseTemplate);

    const data = {
      innerHTML: this.fois.map(foi => foi.serialize()),
    };

    return template(data);
  }
}
