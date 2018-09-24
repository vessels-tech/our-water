import * as React from 'react'; 
import { Component } from 'react';
import { View, TouchableNativeFeedback } from "react-native";
import { bgMed, textLight, textDark } from "../utils/Colors";
import { Text } from "react-native-elements";
import { ConfigFactory } from '../config/ConfigFactory';
import NetworkApi from '../api/NetworkApi';
import { AppContext } from '../AppProvider';
//@ts-ignore
// import { connect } from 'react-context-api-store';

import * as appActions from '../actions/index';

import { connect } from 'react-redux'
import { AppState } from '../reducers';


export interface Props {  
  //Where do these come from?
  isConnected: boolean,
  dispatch: any,
  connectionStatusChanged: any,
}

export interface State {
  
}


class NetworkStatusBanner extends Component<Props> {
    
    constructor(props: Props) {
      super(props);
    }


    render() {
      
      // if (this.props.isConnected) {
      //   return null;
      // }

      let text = `Network is offline.`;
      if (this.props.isConnected) {
        text = 'Network is online.';
      }
      return (
        <TouchableNativeFeedback
          onPress={() => this.props.connectionStatusChanged(!this.props.isConnected)}>
          {/* onPress={() => this.props.dispatch(appActions.toggleConnection(!this.props.isConnected))}> */}
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



// export default NetworkStatusBannerWithContext;
//implement mapStateToProps and mapDispatchToProps here

const mapStateToProps = (state: AppState) => {
  console.log("mapping state to props", state);
  return {
    isConnected: state.isConnected,
  }
}

const mapDispatchToProps = (dispatch: any) => {
  return {
    connectionStatusChanged: (isConnected: boolean) => {dispatch(appActions.toggleConnection(isConnected))}
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(NetworkStatusBanner);