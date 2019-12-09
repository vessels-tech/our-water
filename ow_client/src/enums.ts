export enum MapHeightOption {
  default = '100%',
  small = '100%',
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
  quality = 'quality',
  custom = 'custom',
}

export const ResourceTypeArray: Array<string> = Object.keys(ResourceType);

export enum BaseApiType{
  MyWellApi = 'MyWellApi',
  GGMNApi = 'GGMNApi',
};

export enum HomeScreenType {
  Simple = "Simple", //MyWell
  Map = "Map", //GGMN
}

export enum ScrollDirection {
  Horizontal = "Horizontal",
  Vertical = "Vertical",
}

export enum NavigationStacks {
  Root = 'app.Root',
  Modal = 'app.Modal'
}

export enum NavigationButtons {
  Back = 'backButton',
  ModalBack = 'modalBack',
  Search = 'searchButton',
  SideMenu = 'sideMenuButton'
}