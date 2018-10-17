import * as React from 'react';
import { Component } from 'react';
import { Text } from 'react-native-elements';
import { ConfigFactory } from '../config/ConfigFactory';
import BaseApi from '../api/BaseApi';
import { View, TouchableNativeFeedback, ToastAndroid } from 'react-native';
import { randomPrettyColorForId, navigateTo } from '../utils';
//@ts-ignore
import QRCodeScanner from 'react-native-qrcode-scanner';
import { bgMed } from '../utils/Colors';
import { AppState } from '../reducers';
import { UserType } from '../typings/UserTypes';
import { connect } from 'react-redux';
import { SomeResult, ResultType } from '../typings/AppProviderTypes';
import { ResourceScanResult } from '../typings/models/OurWater';
import { validateScanResult } from '../api/ValidationApi';
import * as EnvironmentConfig from '../utils/EnvConfig';

const orgId = EnvironmentConfig.OrgId;


export interface OwnProps {
  navigator: any;
  config: ConfigFactory,
  appApi: BaseApi,
}

export interface StateProps {
  userId: string,

}

export interface ActionProps {

}

export type ScanResult = {
  data: string,
} 


class ScanScreen extends Component<OwnProps & StateProps & ActionProps> {
  constructor(props: OwnProps & StateProps & ActionProps) {
    super(props);

  }

  /**
   * The scanner can scan any type of barcode or qr code.
   * we need to verify that it is an OurWater QR code, 
   * and that the orgId matches this app's org id
   * 
   * //TODO: eventally handle this with deep linking. For now, don't worry about it.
   */
  onScan(result: any) {
    const validationResult: SomeResult<ResourceScanResult> = validateScanResult(result, orgId);
    
    if (validationResult.type === ResultType.ERROR) {
      // TODO: Translation
      ToastAndroid.show('Could not find a location from the QR Code. Please try scanning again.', ToastAndroid.LONG);
      //TODO: reset the scanner somehow.

      return;
    }

    const scanResult = validationResult.result;

    //Navigate to a standalone resource view
    const resourceId = scanResult.id;
    navigateTo(this.props, 'screen.SimpleResourceDetailScreen', resourceId, {
      resourceId,
      config: this.props.config,
      userId: this.props.userId
    });
  }

  render() {
    return (
      <View style={{
        width: '100%',
        height: '100%',
        backgroundColor: bgMed,
        alignContent: 'center',
      }}>
        <QRCodeScanner
          onRead={(result: any) => this.onScan(result)}
          topContent={
            <Text style={{ fontWeight: '800', fontSize: 20 }}>Scan for a Location using a QR code.</Text>
          }
          bottomContent={
            null
          }
        />
      </View>
    )
  }

}

//If we don't have a user id, we should load a different app I think.
const mapStateToProps = (state: AppState, ownProps: OwnProps): StateProps => {
  let userId = ''; //I don't know if this fixes the problem...

  if (state.user.type === UserType.USER) {
    userId = state.user.userId;
  }

  return {
    userId,
  }
}

const mapDispatchToProps = (dispatch: any): ActionProps => {
  return {
    // addRecent: (api: BaseApi, userId: string, resource: Resource) => {
    //   dispatch(appActions.addRecent(api, userId, resource))
    // },
    // loadResourcesForRegion: (api: BaseApi, userId: string, region: Region) =>
    //   dispatch(appActions.getResources(api, userId, region)),
    // startExternalSync: (api: MaybeExternalServiceApi, userId: string) =>
    //   dispatch(appActions.startExternalSync(api, userId)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ScanScreen);
