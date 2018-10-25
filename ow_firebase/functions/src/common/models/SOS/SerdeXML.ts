export default interface SerdeXML {
  serialize(): string;
  deserialize?(xmlString: string): SerdeXML;
}