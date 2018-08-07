export enum ResourceType {
  Well = 'well',
  Raingauge = 'raingauge',
  Checkdam = 'checkdam',
}


export const resourceTypeFromString = (type: string) => {
  switch(type) {
    case 'well':
      return ResourceType.Well;
    case 'raingauge':
      return ResourceType.Raingauge;
    case 'checkdam':
      return ResourceType.Checkdam;
    default:
      throw new Error(`Unknown ResourceType conversion: ${type}`);
  }
}


