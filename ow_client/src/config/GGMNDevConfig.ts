import { RemoteConfig } from "./ConfigFactory";
import { BaseApiType, HomeScreenType, ResourceType, ScrollDirection } from "../enums";
import { translationsForTranslationOrg, possibleTranslationsForOrg } from "ow_translations";
import * as EnvConfig from '../utils/EnvConfig';
import { TimeseriesRange } from "../typings/models/OurWater";
const orgId = EnvConfig.OrgId;


//TODO: make this much more typesafe etc.
const GGMNDevConfig: RemoteConfig = {
  applicationName: 'GGMN',
  baseApiType: BaseApiType.GGMNApi,
  firebaseBaseUrl: 'localhost:5000',
  ggmnBaseUrl: 'https://ggmn.lizard.net',
  showConnectToButton: true,
  showSyncButton: true,
  showPendingButton: false,
  mywellBaseUrl: '',
  map_shouldLoadAllResources: false,
  newReading_enableImageUpload: false,
  homeScreen: HomeScreenType.Map,
  resourceDetail_showSubtitle: true,
  resourceDetail_allowEditing: true,
  resourceDetail_allowDelete: true,
  resourceDetail_editReadings: true,
  favouriteResourceList_showGetStartedButtons: false,
  editResource_hasResourceName: true,
  editResource_showOwerName: false,
  editResource_availableTypes: '["well"]',
  editResource_defaultTypes: '{"well":[{"name":"GWmMSL","parameter":"GWmMSL","readings":[],"unitOfMeasure":"m"},{"name":"GWmBGS","parameter":"GWmBGS","readings":[],"unitOfMeasure":"m"}]}',
  editResource_allowCustomId: true,
  editResource_hasWaterColumnHeight: true,
  favouriteResource_scrollDirection: ScrollDirection.Horizontal,
  usesShortId: false,
  allowsUserRegistration: false,
  translations: translationsForTranslationOrg(orgId),
  translationOptions: possibleTranslationsForOrg(orgId),
  ggmn_ignoreReading: { date: "2017-01-01T00:00:00.000Z", value: 0 },
  map_regionChangeReloadDebounceTimeMs: 1000,
  showMapInSidebar: false,
  resourceDetail_shouldShowTable: false,
  resourceDetail_shouldShowQRCode: false,
  favouriteResource_showPendingResources: false,
  availableGroupTypes: {},
  shouldUseV1Search: true,
  resourceDetail_allowDownload: false,
  readingDownloadUrl: "",
  resorceDetail_graphButtons: [
    { text: '1Y', value: TimeseriesRange.ONE_YEAR },
    { text: '3M', value: TimeseriesRange.THREE_MONTHS },
    { text: '2W', value: TimeseriesRange.TWO_WEEKS },
    { text: 'EXTENT', value: TimeseriesRange.EXTENT },
  ],
  resourceDetail_graphUsesStrictDate: false,
}

export default GGMNDevConfig;