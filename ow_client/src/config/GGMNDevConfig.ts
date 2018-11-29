import { RemoteConfig } from "./ConfigFactory";
import { BaseApiType, HomeScreenType, ResourceType, ScrollDirection } from "../enums";
import { translationsForTranslationOrg, possibleTranslationsForOrg } from "ow_translations";
import * as EnvConfig from '../utils/EnvConfig';
const orgId = EnvConfig.OrgId;


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
  resourceDetail_showSubtitle: true,
  resourceDetail_allowEditing: true,
  resourceDetail_allowDelete: true,
  resourceDetail_editReadings: true,
  favouriteResourceList_showGetStartedButtons: false,
  editResource_hasResourceName: true,
  editResource_showOwerName: false,
  editResource_availableTypes: '["well"]',
  editResource_defaultTypes: '{"well":[{"name":"GWmMSL","parameter":"GWmMSL","readings":[]},{"name":"GWmBGS","parameter":"GWmBGS","readings":[]}]}',
  editResource_allowCustomId: true,
  favouriteResource_scrollDirection: ScrollDirection.Horizontal,
  usesShortId: false,
  allowsUserRegistration: false,
  translations: translationsForTranslationOrg(orgId),
  translationOptions: possibleTranslationsForOrg(orgId),
}

export default GGMNDevConfig;