import * as React from 'react'; import { Component } from 'react';
import {
  ActivityIndicator,
} from 'react-native';
import { primary } from '../../utils/Colors';
import { isNullOrUndefined } from 'util';


/**
 * A simple loading indicator
 * 
 */
export interface Props {
  style?: any,
  size?: 'large' | 'small',
}

class Loading extends Component<Props> {

  render() {
    let size: 'large' | 'small' = 'large';
    if (!isNullOrUndefined(this.props.size)) {
      size = this.props.size;
    }

    return (
      <ActivityIndicator 
        style={{justifyContent: 'center', ...this.props.style}}
        size={size} 
        color={primary}
      />
    );
  }
};

export default Loading;