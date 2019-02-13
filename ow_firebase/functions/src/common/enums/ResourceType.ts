export enum DepResourceType {
  Well = 'well',
  Raingauge = 'raingauge',
  Checkdam = 'checkdam',
  Quality = 'quality',
  // TODO: remove this! HAck for the front end to work
  well = 'well',
  raingauge = 'raingauge',
  checkdam = 'checkdam',
  quality = 'quality',
}


export const resourceTypeFromString = (type: string) => {
  switch(type) {
    case 'well':
      return DepResourceType.Well;
    case 'raingauge':
      return DepResourceType.Raingauge;
    case 'checkdam':
      return DepResourceType.Checkdam;
    case 'quality': 
      return DepResourceType.Quality;
    default:
      throw new Error(`Unknown ResourceType conversion: ${type}`);
  }
}