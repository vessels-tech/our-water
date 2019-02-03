import { RemoteConfig } from "./ConfigFactory";
import { BaseApiType, HomeScreenType, ResourceType, ScrollDirection } from "../enums";
import * as EnvConfig from '../utils/EnvConfig';
import { translationsForTranslationOrg, possibleTranslationsForOrg } from "ow_translations";
const orgId = EnvConfig.OrgId;

const MyWellDevConfig: RemoteConfig = {
  applicationName: 'MyWell',
  baseApiType: BaseApiType.MyWellApi,
  firebaseBaseUrl: 'localhost:5000',
  ggmnBaseUrl: 'https://ggmn.lizard.net/api',
  showConnectToButton: false,
  showSyncButton: false,
  showPendingButton: true,
  mywellBaseUrl: 'https://mywell-server.vessels.tech',
  //This should be false, just for fixing map layout problems
  map_shouldLoadAllResources: true,
  newReading_enableImageUpload: true,
  // homeScreen: HomeScreenType.Map,
  homeScreen: HomeScreenType.Simple,
  resourceDetail_showSubtitle: true,
  resourceDetail_allowEditing: false,
  resourceDetail_allowDelete: false,
  resourceDetail_editReadings: false,
  favouriteResourceList_showGetStartedButtons: true,
  editResource_hasResourceName: false,
  editResource_showOwerName: true,
  editResource_availableTypes: '["well","raingauge","quality","checkdam"]',
  editResource_defaultTypes: '{"well":[{"name":"default","parameter":"gwmbgs","readings":[]}],"raingauge":[{"name":"default","parameter":"gwmbgs","readings":[]}],"quality":[{"name":"salinity","parameter":"salinity","readings":[]},{"name":"ph","parameter":"ph","readings":[]},{"name":"nitrogen","parameter":"nitrogen","readings":[]}],"checkdam":[{"name":"default","parameter":"gwmbgs","readings":[]}]}',
  editResource_allowCustomId: false,
  editResource_hasWaterColumnHeight: true,
  favouriteResource_scrollDirection: ScrollDirection.Vertical,
  usesShortId: true,
  allowsUserRegistration: true,
  translations: translationsForTranslationOrg(orgId),
  translationOptions: possibleTranslationsForOrg(orgId),
  //Not used in MyWell
  ggmn_ignoreReading: { date: "2017-01-01T00:00:00.000Z", value: 0 },
  map_regionChangeReloadDebounceTimeMs: 1000,
}

export default MyWellDevConfig;``