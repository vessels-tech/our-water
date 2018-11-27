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
  resourceDetail_allowEditing: false,
  resourceDetail_allowDelete: false,
  resourceDetail_editReadings: false,
  favouriteResourceList_showGetStartedButtons: true,
  editResource_showOwerName: true,
  editResource_availableTypes: [
    ResourceType.well,
    ResourceType.raingauge,
    ResourceType.quality,
    ResourceType.checkdam,
  ],
  editResource_defaultTypes: {
    well: [{ name: 'default', parameter: 'gwmbgs', readings: [] }],
    raingauge: [{ name: 'default', parameter: 'gwmbgs', readings: [] }],
    quality: [
      { name: 'salinity', parameter: 'salinity', readings: [] },
      { name: 'ph', parameter: 'ph', readings: [] },
      { name: 'nitrogen', parameter: 'nitrogen', readings: [] },
    ],
    checkdam: [{ name: 'default', parameter: 'gwmbgs', readings: [] }],
  }, 
  editResource_allowCustomId: false,
  favouriteResource_scrollDirection: ScrollDirection.Vertical,
  usesShortId: true,
  allowsUserRegistration: true,
}

export default MyWellDevConfig;