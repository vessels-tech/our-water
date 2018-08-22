import React, { Component } from 'react';
import {
  // Platform,
  // StyleSheet,
  // ScrollView,
  View,
  // TextInput,
  // WebView,
} from 'react-native';
import {
  Button,
  Text,
  ListItem,
} from 'react-native-elements';
// import Icon from 'react-native-vector-icons/FontAwesome';
import PropTypes from 'prop-types';
import {
  navigateTo,
} from '../utils';
import { primary, primaryDark, bgLight, textDark, bgLightHighlight } from '../utils/Colors';

class SettingsScreen extends Component<Props> {

  constructor(props) {
    super(props);

    console.log('SettingsScreen.props:', props);
  }

  /**
   * Connect to button is only available for variants which connect to external services
   */
  getConnectToButton() {
    if (!this.props.config.showConnectToButton) {
      return false;
    }

    return (
      <ListItem
        title={this.props.config.getConnectToButtonText}
        onPress={() => console.log("GGMN pressed")}
        leftIcon={{
          name: 'account-circle',
          color: textDark,
        }}
        hideChevron
        disabled
      />
    );
  }

  render() {
    return (
      <View style={{
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
       
      </View>
    );
  }
}

export default SettingsScreen;