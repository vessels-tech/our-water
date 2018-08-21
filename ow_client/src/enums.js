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

export const ResourceTypes = {
  well: 'well',
  raingauge: 'raingauge',
  checkdam: 'checkdam',
  custom: 'custom',
}

export const ResourceTypeArray = Object.values(ResourceTypes);

export const BaseApiType = {
  MyWellApi: 'MyWellApi',
  GGMNApi: 'GGMNApi',
};