import { RemoteConfig } from "./ConfigFactory";
import { BaseApiType } from "../enums";


const MyWellDevConfig: RemoteConfig = {
  applicationName: 'MyWell',
  baseApiType: BaseApiType.MyWellApi,
  connectToButtonText: '',
  firebaseBaseUrl: 'localhost:5000',
  ggmnBaseUrl: 'https://ggmn.lizard.net/api',
  showConnectToButton: false,
  mywellBaseUrl: 'https://mywell-server.vessels.tech',
  //This should be false, just for fixing map layout problems
  map_shouldLoadAllResources: true,
}

export default MyWellDevConfig;