/**
 * FirebaseConfig is a wrapper around the firebase config
 * which allows us an entrypoint and testable firebase config
 */
import firebase from 'react-native-firebase';
import Config from 'react-native-config';
import { RemoteConfig } from './ConfigFactory';
import { translationFromJSON } from 'ow_translations';
import { RemoteConfigDeveloperMode } from '../utils/EnvConfig';
const config = firebase.config();

export class FirebaseConfig {

  static getAllConfig() {
    if (RemoteConfigDeveloperMode) {
      config.enableDeveloperMode();
    }

    console.log("FirebaseConfig getting config");
    return config.fetch(parseInt(Config.REACT_APP_REMOTE_CONFIG_TIMEOUT))
      .then(() => config.activateFetched())
      .then(() => config.getKeysByPrefix())
      .then(allKeys => allKeys.map((key: String) => key.toString()))
      .then((allKeys: Array<string>) => config.getValues(allKeys))
      .then((obj: any) => {
        console.log("FirebaseConfig got config");

        const remoteConfig: RemoteConfig = {
          applicationName: obj.applicationName.val(),
          baseApiType: obj.baseApiType.val(),
          firebaseBaseUrl: obj.firebaseBaseUrl.val(),
          ggmnBaseUrl: obj.ggmnBaseUrl.val(),
          showConnectToButton: obj.showConnectToButton.val(),
          showSyncButton: obj.showSyncButton.val(),
          showPendingButton: obj.showPendingButton.val(),
          mywellBaseUrl: obj.mywellBaseUrl.val(),
          map_shouldLoadAllResources: obj.map_shouldLoadAllResources.val(),
          newReading_enableImageUpload: obj.newReading_enableImageUpload.val(),
          homeScreen: obj.homeScreen.val(),
          resourceDetail_showSubtitle: obj.resourceDetail_showSubtitle.val(),
          resourceDetail_allowEditing: obj.resourceDetail_allowEditing.val(),
          resourceDetail_allowDelete: obj.resourceDetail_allowDelete.val(),
          resourceDetail_editReadings: obj.resourceDetail_editReadings.val(),
          favouriteResourceList_showGetStartedButtons: obj.favouriteResourceList_showGetStartedButtons.val(),
          editResource_hasResourceName: obj.editResource_hasResourceName.val(),
          editResource_showOwerName: obj.editResource_showOwerName.val(),
          editResource_availableTypes: obj.editResource_availableTypes.val(),
          editResource_allowCustomId: obj.editResource_allowCustomId.val(),
          editResource_defaultTypes: obj.editResource_defaultTypes.val(),
          editResource_hasWaterColumnHeight: obj.editResource_hasWaterColumnHeight.val(),
          favouriteResource_scrollDirection: obj.favouriteResource_scrollDirection.val(), 
          usesShortId: obj.usesShortId.val(),
          allowsUserRegistration: obj.allowsUserRegistration.val(),
          translations: translationFromJSON(obj.translations.val()),
          translationOptions: JSON.parse(obj.translationOptions.val()),
          ggmn_ignoreReading: JSON.parse(obj.ggmn_ignoreReading.val()),
          map_regionChangeReloadDebounceTimeMs: parseInt(obj.map_regionChangeReloadDebounceTimeMs.val()),
          showMapInSidebar: obj.showMapInSidebar.val(),
          resourceDetail_shouldShowTable: obj.resourceDetail_shouldShowTable.val(),
          resourceDetail_shouldShowQRCode: obj.resourceDetail_shouldShowQRCode.val(),
          favouriteResource_showPendingResources: obj.favouriteResource_showPendingResources.val(),
          availableGroupTypes: JSON.parse(obj.availableGroupTypes.val()),
          shouldUseV1Search: obj.shouldUseV1Search.val(),
          resourceDetail_allowDownload: obj.resourceDetail_allowDownload.val(),
          readingDownloadUrl: obj.readingDownloadUrl.val(),
          resourceDetail_graphButtons: JSON.parse(obj.resourceDetail_graphButtons.val()),
          resourceDetail_graphUsesStrictDate: obj.resourceDetail_graphUsesStrictDate.val(),
        }
        return remoteConfig;
      });
  }

  // static getValue(key) {
  //   //TODO: get the value for the key...
  // }
}