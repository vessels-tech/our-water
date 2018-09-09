import * as React from 'react'; 
import { Component } from 'react';
import { View } from "react-native";
import { bgMed, textLight, textDark } from "../utils/Colors";
import { Text } from "react-native-elements";
import { ConfigFactory } from '../config/ConfigFactory';
import NetworkApi from '../api/NetworkApi';

export interface Props {
  config: ConfigFactory
}

export interface State {
  
}

//TODO: make this DI'd

export default function NetworkStatusBannerFactory(config: ConfigFactory) {

  class NetworkStatusBanner extends Component<Props> {
    networkApi: NetworkApi;
    
    constructor(props: Props) {
      super(props);

      this.networkApi = config.networkApi;
      this.networkApi.addConnectionChangeCallback(
        'networkBanner', 
        (i: boolean) => this.onConnectionChange(i)
      );
    }

    componentWillUnmount() {
      this.networkApi.removeConnectionChangeCallback('networkBanner');
    } 

    onConnectionChange(isConnected: boolean) {
      console.log("connection changed! isConnected:", isConnected);
    }

    render() {
      return (
      <View
        style={{
          backgroundColor: bgMed,
          width: '100%',
          height: 20,
        }}
      >
        <Text
          style={{
            color: textDark,
            textAlign: 'center',
          }}
        >
          {`Network is offline.`}
        </Text>
      </View>
      );
    }
  }

  return NetworkStatusBanner;
}