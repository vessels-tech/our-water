import React, { Component } from 'react';
import {
  ActivityIndicator,
  View
} from 'react-native';
import PropTypes from 'prop-types';
import { primary } from '../utils/Colors';


/**
 * A simple loading indicator
 * 
 */
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