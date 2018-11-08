import { RemoteConfig } from "./ConfigFactory";
import { BaseApiType, HomeScreenType, ResourceType, ScrollDirection } from "../enums";


const MyWellDevConfig: RemoteConfig = {
  applicationName: 'MyWell',
  baseApiType: BaseApiType.MyWellApi,
  firebaseBaseUrl: 'localhost:5000',
  ggmnBaseUrl: 'https://ggmn.lizard.net/api',
  showConnectToButton: false,
  mywellBaseUrl: 'https://mywell-server.vessels.tech',
  //This should be false, just for fixing map layout problems
  map_shouldLoadAllResources: true,
  newReading_enableImageUpload: true,
  homeScreen: HomeScreenType.Simple,
  resourceDetail_showSubtitle: true,
  favouriteResourceList_showGetStartedButtons: true,
  editResource_showOwerName: true,
  editResource_availableTypes: [
    ResourceType.well,
    ResourceType.raingauge,
    ResourceType.quality,
    ResourceType.checkdam,
  ],
  editResource_allowCustomId: false,
  favouriteResource_scrollDirection: ScrollDirection.Vertical,
}

export default MyWellDevConfig;