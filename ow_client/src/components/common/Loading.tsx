import * as React from 'react'; import { Component } from 'react';
import {
  ActivityIndicator,
} from 'react-native';
import { primary } from '../../utils/Colors';


/**
 * A simple loading indicator
 * 
 */
export interface Props {
  style?: any,
}

class Loading extends Component<Props> {

  render() {
    return (
      <ActivityIndicator 
        style={{justifyContent: 'center'}}
        size="large" 
        color={primary}
      />
    );
  }
};

export default Loading;