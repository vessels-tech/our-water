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
      
      // if (this.props.isConnected) {
      //   return null;
      // }

      let text = `Network is online`;
      if (!this.props.isConnected) {
        text = `Network is offline.`;
      }

      return (
        <TouchableNativeFeedback
          onPress={() => this.props.testChangeStore()}>
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

// const NetworkStatusBannerWithContext = (props: any) => {
//   return (
//     <AppContext.Consumer>
//       {({ isConnected}) => (
//         <NetworkStatusBanner
//           isConnected={isConnected}
//           {...props}
//         />
//       )}
//     </AppContext.Consumer>
//   );
// };

// export default NetworkStatusBannerWithContext;


export default connect((store: any) => ({
  isConnected: store.isConnected,
}), {
  //TODO: actions relevant to this component here
  testChangeStore(store: any) {
    console.log("updating store", store);
    store.updateStore({isConnected: !store.state.isConnected})
  }
})(NetworkStatusBanner);