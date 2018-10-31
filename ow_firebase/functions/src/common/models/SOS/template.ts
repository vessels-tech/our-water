import SerdeXML from './SerdeXML';

export default class Template implements SerdeXML {
  id: string;



  serialize(): string {
    return ''
  }

  deserialize(xmlString: string): SerdeXML {
    return new Template();
  }
}
