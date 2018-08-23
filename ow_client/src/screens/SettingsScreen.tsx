import * as React from 'react';
import {
  View,
} from 'react-native';
import {
  ListItem,
} from 'react-native-elements';
import {
  navigateTo,
} from '../utils';
import { primary, primaryDark, textDark, } from '../utils/Colors';
import { ConfigFactory } from '../utils/ConfigFactory';

export interface Props {
  config: ConfigFactory
}

export interface State {

}

export default class SettingsScreen extends React.Component<Props> {

  constructor(props: Props) {
    super(props);

    console.log('SettingsScreen.props:', props);
  }

  /**
   * Connect to button is only available for variants which connect to external services
   */
  getConnectToButton() {
    if (!this.props.config.getShowConnectToButton()) {
      return false;
    }

    return (
      <ListItem
        title={this.props.config.getConnectToButtonText()}
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