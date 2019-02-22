import { RemoteConfig } from "./ConfigFactory";
import { BaseApiType, HomeScreenType, ResourceType, ScrollDirection } from "../enums";
import * as EnvConfig from '../utils/EnvConfig';
import { translationsForTranslationOrg, possibleTranslationsForOrg } from "ow_translations";
const orgId = EnvConfig.OrgId;

const MyWellDevConfig: RemoteConfig = {
  applicationName: 'MyWell',
  baseApiType: BaseApiType.MyWellApi,
  firebaseBaseUrl: 'https://us-central1-our-water-dev.cloudfunctions.net',
  // firebaseBaseUrl: 'https://ourwater.localtunnel.me/our-water-dev/us-central1',
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
  editResource_defaultTypes: '{"well":[{"name":"default","parameter":"default","readings":[],"unitOfMeasure":"m"}],"raingauge":[{"name":"default","parameter":"default","readings":[],"unitOfMeasure":"mm"}],"quality":[{"name":"salinity","parameter":"salinity","readings":[],"unitOfMeasure":"ppm"},{"name":"ph","parameter":"ph","readings":[],"unitOfMeasure":"ppm"},{"name":"nitrogen","parameter":"nitrogen","readings":[],"unitOfMeasure":"ppm"}],"checkdam":[{"name":"default","parameter":"default","readings":[],"unitOfMeasure":"m"}]}',
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
  showMapInSidebar: true,
  resourceDetail_shouldShowTable: true,
  resourceDetail_shouldShowQRCode: true,
  favouriteResource_showPendingResources: true,
  availableGroupTypes: {
    pincode: { id: 'pincode', required: true, order: 1 },
    country: { id: 'country', required: true, order: 0 },
  },
  shouldUseV1Search: false,
}

export default MyWellDevConfig;``