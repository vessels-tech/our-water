const MapHeightOptions = {
  default: 300,
  small: 100,
  fullscreen: '100%',
};

const MapStateOptions = {
  default: 0,
  small: 1,
  fullscreen: 2
};

const ResourceTypes = {
  well: 'well',
  raingauge: 'raingauge',
  checkdam: 'checkdam',
  custom: 'custom',
}

const ResourceTypeArray = Object.values(ResourceTypes);


export {
  MapHeightOptions,
  MapStateOptions,
  ResourceTypes,
  ResourceTypeArray,
}