import * as React from 'react';
import { Component } from 'react';
import { Text } from 'react-native-elements';
import { ConfigFactory } from '../config/ConfigFactory';
import BaseApi from '../api/BaseApi';
import { View, TouchableNativeFeedback, ToastAndroid, EmitterSubscription } from 'react-native';
import { randomPrettyColorForId, navigateTo, getShortIdOrFallback, unwrapUserId } from '../utils';
//@ts-ignore
import QRCodeScanner from 'react-native-qrcode-scanner';
import { bgMed } from '../utils/Colors';
import { AppState, CacheType } from '../reducers';
import { UserType } from '../typings/UserTypes';
import { connect } from 'react-redux';
import { SomeResult, ResultType } from '../typings/AppProviderTypes';
import { ResourceScanResult } from '../typings/models/OurWater';
import { validateScanResult } from '../api/ValidationApi';
import * as EnvironmentConfig from '../utils/EnvConfig';
import { compose } from 'redux';
import { withTabWrapper } from '../components/TabWrapper';
import { TranslationFile } from 'ow_translations/src/Types';
import { AnyResource } from '../typings/models/Resource';
import * as appActions from '../actions/index';
import { Navigation } from 'react-native-navigation';
import { NavigationStacks } from '../enums';


const orgId = EnvironmentConfig.OrgId;
export interface OwnProps {
  config: ConfigFactory,
}

export interface StateProps {
  userId: string,
  translation: TranslationFile,
  shortIdCache: CacheType<string>,

}

export interface ActionProps {
  getResource: (api: BaseApi, resourceId: string, userId: string) => Promise<SomeResult<AnyResource>>,
  addRecent: (api: BaseApi, userId: string, resource: AnyResource) => any,
}

export interface State {
  isScreenFocussed: boolean,
}


class ScanScreen extends Component<OwnProps & StateProps & ActionProps> {
  appApi: BaseApi;

  state: State = {
    isScreenFocussed: true,
  };
  // navigationListenerDidAppear: EmitterSubscription;
  // navigationListenerDidDisappear: EmitterSubscription;

  constructor(props: OwnProps & StateProps & ActionProps) {
    super(props);

    //@ts-ignore
    this.appApi = props.config.getAppApi();

    console.log('scan screen showing')
    // this.setState({isScreenFocussed: true})

    // this.navigationListenerDidAppear = Navigation.events().registerComponentDidAppearListener(() => {
    //   this.setState({isScreenFocussed: true});
    // });
    //
    // this.navigationListenerDidDisappear = Navigation.events().registerComponentDidDisappearListener(() => {
    //   this.setState({isScreenFocussed: false});
    // });

    /* binds */
    this.onScan = this.onScan.bind(this);
  }

  componentWillUnmount() {
    //Remove the listener. For some reason this still causes setState issues
    // this.navigationListenerDidAppear.remove();
    // this.navigationListenerDidDisappear.remove();
  }

  handleScanError() {
    const { qr_code_not_found } = this.props.translation.templates;

    ToastAndroid.show(qr_code_not_found, ToastAndroid.LONG);
  }

  handleResourceLookupError() {
    const { qr_code_not_found } = this.props.translation.templates;

    ToastAndroid.show(qr_code_not_found, ToastAndroid.LONG);
  }

  /**
   * The scanner can scan any type of barcode or qr code.
   * we need to verify that it is an OurWater QR code,
   * and that the orgId matches this app's org id
   *
   * //TODO: eventally handle this with deep linking. For now, don't worry about it.
   */
  async onScan(result: any) {
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

    const resourceResult = await this.props.getResource(this.appApi, validationResult.result.id, this.props.userId);
    if (resourceResult.type === ResultType.ERROR) {
      return this.handleResourceLookupError();
    }

    this.props.addRecent(this.appApi, this.props.userId, resourceResult.result);
    const shortId = getShortIdOrFallback(resourceResult.result.id, this.props.shortIdCache);

    //Pop to root first!
    Navigation.popToRoot(NavigationStacks.Root);
    navigateTo(this.props, 'screen.SimpleResourceDetailScreen', shortId, {
      resourceId: validationResult.result.id,
      config: this.props.config,
      userId: this.props.userId
    });
  }

  render() {
    const { scan_hint } = this.props.translation.templates;
    return (
      <View style={{
        width: '100%',
        height: '100%',
        backgroundColor: bgMed,
        alignContent: 'center',
      }}>
        {this.state.isScreenFocussed ?
        <QRCodeScanner
          cameraProps={{
            captureAudio: false,
          }}
          reactivate={true}
          showMarker={true}
          reactivateTimeout={1000 * 10}
          onRead={this.onScan}
          topContent={<Text style={{ fontWeight: '800', fontSize: 20 }}>{scan_hint}</Text>}
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

const mapStateToProps = (state: AppState, ownProps: OwnProps): StateProps => {
  return {
    userId: unwrapUserId(state.user),
    translation: state.translation,
    shortIdCache: state.shortIdCache,
  }
}

const mapDispatchToProps = (dispatch: any): ActionProps => {
  return {
    getResource: (api: BaseApi, resourceId: string, userId: string) => {
      return dispatch(appActions.getResource(api, resourceId, userId))
    },
    addRecent: (api: BaseApi, userId: string, resource: AnyResource) => {
      dispatch(appActions.addRecent(api, userId, resource))
    },
  }
}

const enhance = compose(
  connect(mapStateToProps, mapDispatchToProps),
)

export default enhance(ScanScreen)
