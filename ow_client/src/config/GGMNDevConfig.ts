import { RemoteConfig } from "./ConfigFactory";
import { BaseApiType, HomeScreenType, ResourceType } from "../enums";

//TODO: make this much more typesafe etc.
const GGMNDevConfig: RemoteConfig = {
  applicationName: 'GGMN',
  baseApiType: BaseApiType.GGMNApi,
  firebaseBaseUrl: 'localhost:5000',
  ggmnBaseUrl: 'https://ggmn.lizard.net',
  showConnectToButton: true,
  mywellBaseUrl: '',
  map_shouldLoadAllResources: false,
  newReading_enableImageUpload: false,
  homeScreen: HomeScreenType.Map,
  // homeScreen: HomeScreenType.Simple, //just temp until we add resources to mywell and make it useable
  resourceDetail_showSubtitle: false,
  favouriteResourceList_showGetStartedButtons: false,
  editResource_showOwerName: false,
  editResource_availableTypes: [
    ResourceType.well, 
  ]
}

export default GGMNDevConfig;