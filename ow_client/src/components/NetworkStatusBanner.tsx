import * as React from 'react'; 
import { Component } from 'react';
import { View } from "react-native";
import { bgMed, textLight, textDark } from "../utils/Colors";
import { Text } from "react-native-elements";
import { ConfigFactory } from '../config/ConfigFactory';
import NetworkApi from '../api/NetworkApi';
import { AppContext } from '../AppProvider';

export interface Props {  
  isConnected: boolean
}

export interface State {
  
}


class NetworkStatusBanner extends Component<Props> {
    
    constructor(props: Props) {
      super(props);
    }


    render() {
      console.log('NetworkStatusBanner isConnected', this.props.isConnected);
      
      if (this.props.isConnected) {
        return null;
      }

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

const NetworkStatusBannerWithContext = (props: any) => {
  return (
    <AppContext.Consumer>
      {({ isConnected}) => (
        <NetworkStatusBanner
          isConnected={isConnected}
          {...props}
        />
      )}
    </AppContext.Consumer>
  );
};

export default NetworkStatusBannerWithContext;