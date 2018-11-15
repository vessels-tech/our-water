export enum ResourceType {
  well = 'well',
  raingauge = 'raingauge',
  checkdam = 'checkdam',
  quality = 'quality',
  custom = 'custom',
}

export const ResourceTypeArray: Array<string> = Object.keys(ResourceType);

export enum BaseApiType {
  MyWellApi = 'MyWellApi',
  GGMNApi = 'GGMNApi',
};