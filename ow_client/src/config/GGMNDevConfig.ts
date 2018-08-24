import { RemoteConfig } from "../utils/ConfigFactory";
import { BaseApiType } from "../enums";


const GGMNDevConfig: RemoteConfig = {
  applicationName: 'GGMN',
  baseApiType: BaseApiType.GGMNApi,
  connectToButtonText: 'Connect to GGMN',
  firebaseBaseUrl: 'localhost:5000',
  ggmnBaseUrl: 'https://ggmn.lizard.net/api',
  showConnectToButton: true,
  mywellBaseUrl: '',
  map_shouldLoadAllResources: true,
}

export default GGMNDevConfig;