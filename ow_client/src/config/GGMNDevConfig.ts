import { RemoteConfig } from "./ConfigFactory";
import { BaseApiType } from "../enums";


const GGMNDevConfig: RemoteConfig = {
  applicationName: 'GGMN',
  baseApiType: BaseApiType.GGMNApi,
  connectToButtonText: 'Connect to GGMN',
  firebaseBaseUrl: 'localhost:5000',
  ggmnBaseUrl: 'https://ggmn.lizard.net',
  showConnectToButton: true,
  mywellBaseUrl: '',
  map_shouldLoadAllResources: false,
}

export default GGMNDevConfig;