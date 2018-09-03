export enum MapHeightOption {
  default = 300,
  small = 100,
  fullscreen = '100%',
};

export enum MapStateOption {
  default = 'default',
  small = 'small',
  fullscreen = 'fullscreen'
};

export enum ResourceType {
  well = 'well',
  raingauge = 'raingauge',
  checkdam = 'checkdam',
  custom = 'custom',
}

export const ResourceTypeArray: Array<string> = Object.keys(ResourceType);

export enum BaseApiType{
  MyWellApi = 'MyWellApi',
  GGMNApi = 'GGMNApi',
};