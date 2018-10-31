import * as React from 'react'; 
import { Component } from 'react';
import { View, TouchableNativeFeedback } from "react-native";
import { bgMed, secondaryText } from "../utils/Colors";
import { Text } from "react-native-elements";
import { ConfigFactory } from '../config/ConfigFactory';
import NetworkApi from '../api/NetworkApi';
//@ts-ignore
// import { connect } from 'react-context-api-store';

import * as appActions from '../actions/index';

import { connect } from 'react-redux'
import { AppState } from '../reducers';


export interface OwnProps {  
}

export interface StateProps {
  isConnected: boolean,
}

export interface ActionProps {

}

export interface State {
  
}


class NetworkStatusBanner extends Component<OwnProps & StateProps & ActionProps> {
    
  constructor(props: OwnProps & StateProps & ActionProps) {
    super(props);
  }


  render() {  
    if (this.props.isConnected) {
      return null;
    }

    let text = `Network is offline.`;
  
    return (
      // <TouchableNativeFeedback
        // onPress={() => this.props.connectionStatusChanged(!this.props.isConnected)}>
        /* onPress={() => this.props.dispatch(appActions.toggleConnection(!this.props.isConnected))}> */
        <View
          style={{
            backgroundColor: bgMed,
            width: '100%',
            height: 20,
          }}
          >
          <Text
            style={{
              color: secondaryText,
              textAlign: 'center',
            }}
            >
            {text}
          </Text>
        </View>
      // </TouchableNativeFeedback>
    );
  }
}


const mapStateToProps = (state: AppState): StateProps => {
  return {
    isConnected: state.isConnected,
  }
}

const mapDispatchToProps = (dispatch: any): ActionProps => {
  return {

  }
}

export default connect(mapStateToProps, mapDispatchToProps)(NetworkStatusBanner);