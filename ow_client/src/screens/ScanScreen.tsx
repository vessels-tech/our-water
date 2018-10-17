import * as React from 'react';
import { Component } from 'react';
import { Text } from 'react-native-elements';
import { ConfigFactory } from '../config/ConfigFactory';
import BaseApi from '../api/BaseApi';
import { View, TouchableNativeFeedback } from 'react-native';
import { randomPrettyColorForId, navigateTo } from '../utils';
//@ts-ignore
import QRCodeScanner from 'react-native-qrcode-scanner';
import { bgMed } from '../utils/Colors';
import { AppState } from '../reducers';
import { UserType } from '../typings/UserTypes';
import { connect } from 'react-redux';

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

    this.onScan.bind(this);
  }

  onScan(result: ScanResult) {
    console.log("onScan", result.data);

    //TODO: eventally handle this with deep linking. For now, don't worry about it.


    //TODO: if this is a MyWell Url, handle accordingly
    //https://mywell.vessels.tech/resource/12345
    //Load the location by short id, then navigate to

    //Navigate to a standalone resource view
    const resourceId = "12345";
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
          onRead={this.onScan}
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
