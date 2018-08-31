import * as React from 'react';
import {
  View, KeyboardAvoidingView, ScrollView,
} from 'react-native';
import {
  ListItem,
} from 'react-native-elements';
import {
  navigateTo, showModal,
} from '../utils';
import { primary, primaryDark, textDark, } from '../utils/Colors';
import { ConfigFactory } from '../config/ConfigFactory';

export interface Props {
  config: ConfigFactory
}

export interface State {
  isConnectedToExternalService: boolean

}

export default class SettingsScreen extends React.Component<Props> {
  state: State = {
    isConnectedToExternalService: true,
    //TODO: maybe have an error with external service connection flag as well?
  }

  constructor(props: Props) {
    super(props);

    console.log('SettingsScreen.props:', props);

    //TODO: do check to see if we are connected to external service, and see if there is an error
  }

  /**
   * Connect to button is only available for variants which connect to external services
   * 
   * //TODO: if already connected, display a button that says "Connected to XYZ"
   */
  getConnectToButton() {
    if (!this.props.config.getShowConnectToButton()) {
      return false;
    }

    let title = this.props.config.getConnectToButtonText();
    const { isConnectedToExternalService } = this.state;
    if (isConnectedToExternalService) {
      title = this.props.config.getConnectToButtonConnectedText();
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
            isConnected: isConnectedToExternalService,
          }
        )}
        leftIcon={{
          name: 'account-circle',
          color: textDark,
        }}
        hideChevron
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
          title="Register a resource"
          onPress={() =>
            //TODO: dismiss the sidebar
            navigateTo(this.props, 'screen.EditResourceScreen', 'New Resource', {})
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