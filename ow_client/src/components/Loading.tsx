import * as React from 'react'; import { Component } from 'react';
import {
  ActivityIndicator,
} from 'react-native';
import { primary } from '../utils/Colors';


/**
 * A simple loading indicator
 * 
 */
export interface Props {

}

class Loading extends Component<Props> {

  render() {
    return (
      <ActivityIndicator 
        size="large" 
        color={primary}
      />
    );
  }
};

export default Loading;