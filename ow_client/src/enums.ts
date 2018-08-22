export const MapHeightOptions = {
  default: 300,
  small: 100,
  fullscreen: '100%',
};

export const MapStateOptions = {
  default: 0,
  small: 1,
  fullscreen: 2
};

export enum ResourceType {
  well = 'well',
  raingauge = 'raingauge',
  checkdam = 'checkdam',
  custom = 'custom',
}

export const ResourceTypeArray: Array<string> = Object.keys(ResourceType);

export const BaseApiType = {
  MyWellApi: 'MyWellApi',
  GGMNApi: 'GGMNApi',
};