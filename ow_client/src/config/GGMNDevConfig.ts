import { RemoteConfig } from "./ConfigFactory";
import { BaseApiType } from "../enums";

//TODO: make this much more typesafe etc.
const GGMNDevConfig: RemoteConfig = {
  applicationName: 'GGMN',
  baseApiType: BaseApiType.GGMNApi,
  connectToButtonText: 'Connect to GGMN',
  firebaseBaseUrl: 'localhost:5000',
  ggmnBaseUrl: 'https://ggmn.lizard.net',
  showConnectToButton: true,
  mywellBaseUrl: '',
  map_shouldLoadAllResources: false,
  connectToDescription: 'Connect to GGMN to create new wells and save readings from your device.',
  connectToText: 'Connected to GGMN',
  settings_registerResourceText: 'Register a new Well',
  newReading_enableImageUpload: false,
  searchHint: 'Search for Groundwater Stations by Id, Organisation, or Code'
}

export default GGMNDevConfig;