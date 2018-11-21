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
import { parse } from 'url';
import { compose } from 'redux';
import { withTabWrapper } from '../components/TabWrapper';
import { TranslationFile } from 'ow_translations/src/Types';

const orgId = EnvironmentConfig.OrgId;


export interface OwnProps {
  navigator: any;
  config: ConfigFactory,
  appApi: BaseApi,
}

export interface StateProps {
  userId: string,
  translation: TranslationFile,

}

export interface ActionProps {

}

export interface State { 
  isScreenFocussed: boolean,
}


class ScanScreen extends Component<OwnProps & StateProps & ActionProps> {
  state: State = {
    isScreenFocussed: true,
  };
  navigationListener: any;

  constructor(props: OwnProps & StateProps & ActionProps) {
    super(props);

    this.navigationListener = this.props.navigator.addOnNavigatorEvent((event: any) => this.onNavigationEvent(event));
  }

  componentWillUnmount() {
    
    //Remove the listener. For some reason this still causes setState issues
    this.navigationListener();
  }

  onNavigationEvent(event: any) {
    switch(event.id) {
      case 'willAppear': 
        this.setState({isScreenFocussed: true});
      break;
      case 'willDisappear':
        this.setState({ isScreenFocussed: false });
      break;
    }
  }

  handleScanError() {
    const { qr_code_not_found } = this.props.translation.templates;
    //TODO: translate
    ToastAndroid.show(qr_code_not_found, ToastAndroid.LONG);
    //TODO: reset scanner
    return;
  }

  /**
   * The scanner can scan any type of barcode or qr code.
   * we need to verify that it is an OurWater QR code, 
   * and that the orgId matches this app's org id
   * 
   * //TODO: eventally handle this with deep linking. For now, don't worry about it.
   */
  onScan(result: any) {
    if (!result || !result.data) {
      return this.handleScanError();
    }

    let parsedData = null;
    try {
      parsedData = JSON.parse(result.data);
    } catch(err) {
    
      return this.handleScanError();
    }

    const validationResult: SomeResult<ResourceScanResult> = validateScanResult(parsedData, orgId);    
    if (validationResult.type === ResultType.ERROR) {
      return this.handleScanError();
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
    //TODO: translate
    const scan_hint = 'Scan for a Location using a QR code';

    return (
      <View style={{
        width: '100%',
        height: '100%',
        backgroundColor: bgMed,
        alignContent: 'center',
      }}>
        {this.state.isScreenFocussed ? 
        <QRCodeScanner
          reactivate={true}
          showMarker={true}
          reactivateTimeout={1000 * 10}
          onRead={(result: any) => this.onScan(result)}
          topContent={
            <Text style={{ fontWeight: '800', fontSize: 20 }}>{scan_hint}</Text>
          }
          bottomContent={
            null
          }
        />
        : null
        }
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
    translation: state.translation,
  }
}

const mapDispatchToProps = (dispatch: any): ActionProps => {
  return {
  }
}

// export default connect(mapStateToProps, mapDispatchToProps)(ScanScreen);
// const connected = connect(mapStateToProps, mapDispatchToProps)(ScanScreen);

// export default wrapTabComponent(connected, {});


const enhance = compose(
  withTabWrapper,
  connect(mapStateToProps, mapDispatchToProps),
)

export default enhance(ScanScreen)