import * as React from 'react';
import { Component } from 'react';
import { Text } from 'react-native-elements';
import { ConfigFactory } from '../config/ConfigFactory';
import BaseApi from '../api/BaseApi';
import { View } from 'react-native';

export interface OwnProps {
  navigator: any;
  config: ConfigFactory,
  appApi: BaseApi,
}

export interface StateProps {

}

export interface ActionProps {

}



class HomeSimpleScreen extends Component<OwnProps & StateProps & ActionProps> {

  render() {
    return (
      <View style={{
        width: '100%',
        height: '100%',
        backgroundColor: 'tomato',
        alignContent: 'center',
      }}>
        <Text>This is the simpler version</Text>

      </View>
    )
  }

}

export default HomeSimpleScreen;