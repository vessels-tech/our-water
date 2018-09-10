import * as React from 'react'; 
import { Component } from 'react';
import { View, TouchableNativeFeedback } from "react-native";
import { bgMed, textLight, textDark } from "../utils/Colors";
import { Text } from "react-native-elements";
import { ConfigFactory } from '../config/ConfigFactory';
import NetworkApi from '../api/NetworkApi';
import { AppContext } from '../AppProvider';
//@ts-ignore
import { connect } from 'react-context-api-store';

export interface Props {  
  isConnected: boolean,
  
  connectionStatusChanged: any,
  
}

export interface State {
  
}


class NetworkStatusBanner extends Component<Props> {
    
    constructor(props: Props) {
      super(props);
    }


    render() {
      
      if (this.props.isConnected) {
        return null;
      }

      const text = `Network is offline.`;
      return (
        <TouchableNativeFeedback
          onPress={() => this.props.connectionStatusChanged(!this.props.isConnected)}>
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
              {text}
            </Text>
          </View>
        </TouchableNativeFeedback>
      );
    }
}

const NetworkStatusBannerWithContext = (props: any) => {
  return (
    <AppContext.Consumer>
      {({ isConnected, connectionStatusChanged }) => (
        //TODO: how to do callbacks this way?
        <NetworkStatusBanner
          isConnected={isConnected}
          connectionStatusChanged={connectionStatusChanged}
          {...props}
        />
      )}
    </AppContext.Consumer>
  );
};

export default NetworkStatusBannerWithContext;


// export default connect((store: any) => ({
//   isConnected: store.isConnected,
// }), {
//   //TODO: actions relevant to this component here
//   testChangeStore(store: any) {
//     console.log("updating store", store);
//     store.updateStore({isConnected: !store.state.isConnected})
//   }
// })(NetworkStatusBanner);