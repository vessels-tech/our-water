export enum ResourceType {
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
      return ResourceType.Well;
    case 'raingauge':
      return ResourceType.Raingauge;
    case 'checkdam':
      return ResourceType.Checkdam;
    case 'quality': 
      return ResourceType.Quality;
    default:
      throw new Error(`Unknown ResourceType conversion: ${type}`);
  }
}