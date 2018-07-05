const MapHeightOptions = {
  default: 400,
  small: 200,
  //TODO: change to 100%?
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