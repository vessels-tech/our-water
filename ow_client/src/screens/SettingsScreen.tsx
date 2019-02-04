import * as React from 'react';
import {
  View, KeyboardAvoidingView, Button,
} from 'react-native';
import {Button as RNEButton} from 'react-native-elements'
import {
  ListItem,
} from 'react-native-elements';
import {
 showModal, showLighbox, maybeLog, navigateTo,
} from '../utils';
import { error1, secondary, secondaryText, bgLight, } from '../utils/Colors';
import { ConfigFactory } from '../config/ConfigFactory';
import { MaybeExternalServiceApi } from '../api/ExternalServiceApi';
import { ConnectionStatus, AnyLoginDetails } from '../typings/api/ExternalServiceApi';
import Loading from '../components/common/Loading';
import { connect } from 'react-redux'
import { AppState } from '../reducers';
import * as appActions from '../actions/index';
import { UserType } from '../typings/UserTypes';
import { SyncMeta } from '../typings/Reducer';
import { TranslationFile } from 'ow_translations';
import Logo from '../components/common/Logo';
import { secondaryDark } from '../utils/NewColors';

export interface OwnProps {
  navigator: any,
  config: ConfigFactory,
}

export interface StateProps {
  userId: string,
  externalLoginDetails: AnyLoginDetails,
  externalLoginDetailsMeta: SyncMeta,
  translation: TranslationFile
}

export interface ActionProps {
  disconnectFromExternalService: (api: MaybeExternalServiceApi) => any,
}

export interface State {

}

class SettingsScreen extends React.Component<OwnProps & StateProps & ActionProps> {
  externalApi: MaybeExternalServiceApi;
  state: State = {

  }

  constructor(props: OwnProps & StateProps & ActionProps) {
    super(props);

    this.externalApi = this.props.config.getExternalServiceApi();

    /* binds */
    this.showConnectToServiceScreen = this.showConnectToServiceScreen.bind(this);
    this.showSignInScreen = this.showSignInScreen.bind(this);
    this.showSyncScreen = this.showSyncScreen.bind(this);
    this.showPendingScreen = this.showPendingScreen.bind(this);
    this.showSelectLanguageModal = this.showSelectLanguageModal.bind(this);
    this.showEditResourceScreen = this.showEditResourceScreen.bind(this);
    this.logoutPressed = this.logoutPressed.bind(this);
    this.showAboutScreen = this.showAboutScreen.bind(this);
    this.pushMapScreen = this.pushMapScreen.bind(this);
  }


  /**
   * TD: this is the dummy touch event that will be called if this
   * screen is touched by a rogue event.
   */
  showDummyConnectToServiceScreen() {
    maybeLog("showDummyConnectToServiceScreen");
    return;
  }

  showConnectToServiceScreen() {
    const { settings_connect_to_pending_title } = this.props.translation.templates;
    const { externalLoginDetails } = this.props;

    showModal(
      this.props,
      'screen.menu.ConnectToServiceScreen',
      settings_connect_to_pending_title,
      {
        config: this.props.config,
        //TODO: how to get the userId in here???
        userId: this.props.userId,
        isConnected: externalLoginDetails.status === ConnectionStatus.NO_CREDENTIALS,
      }
    );
  }

  showSignInScreen() {
    const { settings_connect_to_pending_title } = this.props.translation.templates;
    const { externalLoginDetails } = this.props;

    showModal(
      this.props,
      'screen.menu.SignInScreen',
      settings_connect_to_pending_title,
      {
        config: this.props.config,
        userId: this.props.userId,
        isConnected: externalLoginDetails.status === ConnectionStatus.NO_CREDENTIALS,
      }
    )
  }

  showSyncScreen() {
    const { settings_sync_heading } = this.props.translation.templates;

    showModal(
      this.props,
      'screen.menu.SyncScreen',
      settings_sync_heading,
      {
        config: this.props.config,
        userId: this.props.userId,
      }
    )
  }

  showPendingScreen() {
    const { settings_pending_heading } = this.props.translation.templates;

    showModal(
      this.props,
      'screen.PendingScreen',
      settings_pending_heading,
      {
        config: this.props.config,
      }
    )
  }

  showSelectLanguageModal() {
    showLighbox(
      this.props,
      'modal.SelectLanguageModal',
      {
        config: this.props.config,
        userId: this.props.userId,
      }
    );
  }

  pushMapScreen() {
    //TODO: Translate
    const settings_map = "Browse on Map"

    navigateTo(
      this.props,
      'screen.SimpleMapScreen',
      settings_map,
      {
        config: this.props.config,
      }
    );
  }

  showEditResourceScreen() {
    const { settings_new_resource } = this.props.translation.templates;
    showModal(this.props, 'screen.menu.EditResourceScreen', settings_new_resource, {
      config: this.props.config,
      userId: this.props.userId,
    })
  }

  logoutPressed() {
    this.props.disconnectFromExternalService(this.externalApi);
  }

  showAboutScreen() {
    const { settings_about } = this.props.translation.templates;

    showModal(
      this.props,
      'AboutScreen',
      settings_about,
      {
        config: this.props.config,
        userId: this.props.userId,
      }
    )
  }

  getDummyConnectToButton() {
    return (
      <ListItem
        containerStyle={{
          height: 0,
          padding: 0,
          margin: 0,
          backgroundColor: secondaryDark,
        }}
        
        onPress={() => this.showDummyConnectToServiceScreen()}
        hideChevron={true}
      />
    );
  }
  
 /**
  * Connect to button is only available for variants which connect to external services
  *
  * if already connected, displays a button that says "Connected to XYZ"
  */
  getConnectToButton() {
    const { 
      externalLoginDetails,
      externalLoginDetailsMeta: { loading },
      translation: { 
        templates: { 
          settings_connect_to_pending_title,
          settings_connect_to_connected_title,
          settings_connect_to_subtitle_error,
          connect_to_service_logout_button,
        } 
      }
    } = this.props;

    if (!this.props.config.getShowConnectToButton()) {
      return null;
    }

    let title = settings_connect_to_pending_title;
    let subtitle;
    if (externalLoginDetails.status !== ConnectionStatus.NO_CREDENTIALS) {
      title = settings_connect_to_connected_title;
    }

    if (externalLoginDetails.status === ConnectionStatus.SIGN_IN_ERROR) {
      subtitle = settings_connect_to_subtitle_error;
    }

    if (externalLoginDetails.status === ConnectionStatus.SIGN_IN_SUCCESS) {
      subtitle = (
        <View style={{
          flexDirection: 'row',
          paddingTop: 5
        }}>
        <Button
          color={secondary}
          title={connect_to_service_logout_button}
          onPress={this.logoutPressed}
        />
        </View>
      );
    }

    let leftIcon: any = {
      name: 'account-circle',
      color: secondaryText,
    };
    if (loading) {
      leftIcon = <Loading style={{paddingRight: 10}} size={'small'}/>
    }

    return (
      <ListItem
        title={title}
        onPress={this.showConnectToServiceScreen}
        disabled={loading}
        leftIcon={leftIcon}
        hideChevron={true}
        subtitle={subtitle}
        subtitleStyle={{
          color: error1,
        }}
      />
    );
  }

  getSignInButton() {
    if (!this.props.config.allowsUserRegistration()) {
      return null;
    }

    const {
      externalLoginDetails,
      externalLoginDetailsMeta: { loading },
      translation: {
        templates: {
          settings_connect_to_pending_title,
          settings_connect_to_connected_title,
          settings_connect_to_subtitle_error,
        }
      }
    } = this.props;

    let title = settings_connect_to_pending_title;
    let subtitle;
    if (externalLoginDetails.status !== ConnectionStatus.NO_CREDENTIALS) {
      title = settings_connect_to_connected_title;
    }

    if (externalLoginDetails.status === ConnectionStatus.SIGN_IN_ERROR) {
      subtitle = settings_connect_to_subtitle_error;
    }

    //TODO: add the user status here
    let leftIcon: any = {
      name: 'account-circle',
      color: secondaryText,
    };
    if (loading) {
      leftIcon = <Loading style={{ paddingRight: 10 }} size={'small'} />
    }

    return (
      <ListItem
        title={title}
        onPress={this.showSignInScreen}
        disabled={loading}
        leftIcon={leftIcon}
        hideChevron={true}
        subtitle={subtitle}
        subtitleStyle={{
          color: error1,
        }}
      />
    );
  }

  getSyncButton() {
    if (!this.props.config.getShowSyncButton()) {
      return null;
    }

    const { translation: { templates: { settings_sync_heading}}} = this.props;

    let leftIcon: any = {
      name: 'sync',
      color: secondaryText,
    };

    return (
      <ListItem
        title={settings_sync_heading}
        onPress={this.showSyncScreen}
        disabled={false}
        leftIcon={leftIcon}
        hideChevron={true}
        // subtitle={''}
        subtitleStyle={{
          color: error1,
        }}
      />
    );
  }

  getPendingButton() {
    if (!this.props.config.getShowPendingButton()) {
      return null;
    }

    const { settings_pending_heading } = this.props.translation.templates;
    
    let leftIcon: any = {
      name: 'sync',
      color: secondaryText,
    };

    return (
      <ListItem
        title={settings_pending_heading}
        onPress={this.showPendingScreen}
        disabled={false}
        leftIcon={leftIcon}
        hideChevron={true}
        // subtitle={''}
        subtitleStyle={{
          color: error1,
        }}
      />
    );
  }

  getMapButton() {
    if (!this.props.config.getShowMapInSidebar()) {
      return null;
    }

    //TODO: Translate
    // const { settings_map } = this.props.translation.templates;
    const settings_map = "Browse on Map"

    return (
      <ListItem
        title={settings_map}
        onPress={this.pushMapScreen}
        leftIcon={{
          name: 'map',
          color: secondaryText,
        }}
        hideChevron={true}
      />
    );    
  }

  getLanguageButton() {
    const { settings_language } = this.props.translation.templates;
    return (
      <ListItem
        title={settings_language}
        onPress={this.showSelectLanguageModal}
        leftIcon={{
          name: 'language',
          color: secondaryText,
        }}
        hideChevron={true}
      />
    );
  }

  getAboutButton() {
    const { settings_about } = this.props.translation.templates;
    return (
      <RNEButton
        style={{
          // paddingBottom: 20,
          // minHeight: 50,
        }}
        buttonStyle={{
          backgroundColor: bgLight,
        }}
        textStyle={{
          color: secondaryText,
          fontSize: 13,
          fontWeight: '400',
          // textTransform: 'capitalize',
        }}
        title={settings_about}
        onPress={this.showAboutScreen}
      />
    );
  }

  render() {
    const { translation: { templates: { settings_new_resource }}} = this.props;

    return (
      <KeyboardAvoidingView style={{
        flexDirection: 'column',
        // justifyContent: 'space-around',
        backgroundColor: bgLight,
        height: '100%',
        width: '100%'
      }}>
        {Logo(this.props.config.getApplicationName())}
        {/* 
          TD we need to put a dummy button in here as for some reason the
          first button is clickable from other views.
        */}
        {this.getDummyConnectToButton()} 
        {/* For connecting to external service */}
        {this.getConnectToButton()} 
        {/* For connecting to default service */}
        {this.getSignInButton()}
        {/* For syncing to an external service */}
        {this.getSyncButton()}
        {/* For saving pending readings/resources to default service */}
        {this.getPendingButton()}
        <ListItem
          title={settings_new_resource}
          onPress={this.showEditResourceScreen}
          leftIcon={{
            name: 'create',
            color: secondaryText,
          }}
          hideChevron={true}
        />
        {/* For browsing resources on map */}
        {this.getMapButton()}

        {this.getLanguageButton()}
        <View 
          style={{
            flex: 1, 
            flexDirection: 'column-reverse',
          }}
          >
          {this.getAboutButton()}
        </View>
      </KeyboardAvoidingView>
    );
  }
}

const mapStateToProps = (state: AppState, ownProps: OwnProps): StateProps => {

  let userId = '';
  if (state.user.type === UserType.USER) {
    userId = state.user.userId;
  }

  return {
    externalLoginDetails: state.externalLoginDetails,
    externalLoginDetailsMeta: state.externalLoginDetailsMeta,
    userId,
    translation: state.translation,
  }
}

const mapDispatchToProps = (dispatch: any): ActionProps => {
  return {
    disconnectFromExternalService: (api: MaybeExternalServiceApi) => dispatch(appActions.disconnectFromExternalService(api)),
  }
}


export default connect(mapStateToProps, mapDispatchToProps)(SettingsScreen);