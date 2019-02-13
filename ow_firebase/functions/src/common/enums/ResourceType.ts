export enum DepResourceType {
  Well = 'well',
  Raingauge = 'raingauge',
  Checkdam = 'checkdam',
  // //TD TODO: remove this! HAck for the front end to work
  well = 'well',
  raingauge = 'raingauge',
  checkdam = 'checkdam',
}


export const resourceTypeFromString = (type: string) => {
  switch(type) {
    case 'well':
      return DepResourceType.Well;
    case 'raingauge':
      return DepResourceType.Raingauge;
    case 'checkdam':
      return DepResourceType.Checkdam;
    default:
      throw new Error(`Unknown ResourceType conversion: ${type}`);
  }
}