import * as React from 'react';
import {
  View, KeyboardAvoidingView, ScrollView,
} from 'react-native';
import {
  ListItem, Badge, Text,
} from 'react-native-elements';
import {
  navigateTo, showModal,
} from '../utils';
import { primary, primaryDark, textDark, error1, } from '../utils/Colors';
import { ConfigFactory } from '../config/ConfigFactory';
import ExternalServiceApi from '../api/ExternalServiceApi';
import { AppContext, SyncMeta } from '../AppProvider';
import BaseApi from '../api/BaseApi';
import { EmptyLoginDetails, LoginDetails, ConnectionStatus } from '../typings/api/ExternalServiceApi';
import Loading from '../components/common/Loading';

export interface Props {
  navigator: any,
  
  //Injected by consumer
  userId: string,
  appApi: BaseApi,
  config: ConfigFactory,
  externalLoginDetails: EmptyLoginDetails | LoginDetails,
  externalLoginDetailsMeta: SyncMeta,

}

export interface State {

}

class SettingsScreen extends React.Component<Props> {
  state: State = {
    //TODO: maybe have an error with external service connection flag as well?
  }

  constructor(props: Props) {
    super(props);

    // this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
  }

  // componentWillUnmount() {
  //   //TODO: unsubscribe
  // }

  // onNavigatorEvent() {

  // }

  /**
   * Connect to button is only available for variants which connect to external services
   * 
   * if already connected, displays a button that says "Connected to XYZ"
   */
  getConnectToButton() {
    const { externalLoginDetails, externalLoginDetailsMeta: { loading } } = this.props;

    console.log("getConnectToButton, externalLoginDetails: ", externalLoginDetails);

    if (!this.props.config.getShowConnectToButton()) {
      return false;
    }

    let title = this.props.config.getConnectToButtonText();
    let subtitle;
    if (externalLoginDetails.status !== ConnectionStatus.NO_CREDENTIALS) {
      title = this.props.config.getConnectToButtonConnectedText();
    }

    if (externalLoginDetails.status === ConnectionStatus.SIGN_IN_ERROR) {
      subtitle = 'Error Logging In';
    }

    let leftIcon: any = {
      name: 'account-circle',
      color: textDark,
    };
    if (loading) {
      leftIcon = <Loading style={{paddingRight: 10}} size={'small'}/>
    }

    return (
      <ListItem
        title={title}
        onPress={() => showModal(
          this.props, 
          'screen.menu.ConnectToServiceScreen',
          this.props.config.getConnectToButtonText(),
          {
            config: this.props.config,
            //TODO: how to get the userId in here???
            userId: '12345',
            isConnected: externalLoginDetails.status === ConnectionStatus.NO_CREDENTIALS,
          }
        )}
        disabled={loading}
        leftIcon={leftIcon}
        hideChevron
        subtitle={subtitle}
        subtitleStyle={{
          color: error1,
        }}
      />
    );
  }

  render() {
    return (
      <KeyboardAvoidingView style={{
        flexDirection: 'column',
        // justifyContent: 'space-around',
        backgroundColor: 'white',
        height: '100%',
        width: '100%'
      }}>
        <View style={{
          width: '100%',
          height: 150,
          backgroundColor: primaryDark,
        }}>
          <View style={{
            alignSelf: 'center',
            marginTop: 25,
            width: 100,
            height: 100,
            backgroundColor: primary,
          }}/>
        </View>
        {this.getConnectToButton()}
        <ListItem
          title={this.props.config.getRegisterResourceButtonText()}
          onPress={() =>
            //TODO: dismiss the sidebar
            navigateTo(this.props, 'screen.EditResourceScreen', 'New Resource', {
              config: this.props.config,
            })
          }
          leftIcon={{
            name: 'create',
            color: textDark,
          }}
          hideChevron
        />
        <ListItem
          title="Language"
          onPress={() => console.log("GGMN pressed")}
          leftIcon={{
            name: 'language',
            color: textDark,
          }}
          hideChevron
          disabled
        />
        {/* TODO: display conditionally, use firebase remote config */}
      </KeyboardAvoidingView>
    );
  }
}

const SettingScreenWithContext = (props: Props) => {
  return (
    <AppContext.Consumer>
      {({ appApi, userId, config, externalLoginDetails, externalLoginDetailsMeta }) => (
        <SettingsScreen
          appApi={appApi}
          userId={userId}
          externalLoginDetails={externalLoginDetails}
          externalLoginDetailsMeta={externalLoginDetailsMeta}
          {...props}
        />
      )}
    </AppContext.Consumer>
  );
}

export default SettingScreenWithContext;