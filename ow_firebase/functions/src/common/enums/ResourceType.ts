import ResourceStationType from "ow_common/lib/enums/ResourceStationType";

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


export const resourceTypeFromString = (type: string): ResourceStationType => {
  switch(type) {
    case 'well':
      return ResourceStationType.well;
    case 'raingauge':
      return ResourceStationType.raingauge;
    case 'checkdam':
      return ResourceStationType.checkdam;
    case 'quality': 
      return ResourceStationType.quality;
    default:
      throw new Error(`Unknown ResourceType conversion: ${type}`);
  }
}