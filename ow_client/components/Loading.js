import React, { Component } from 'react';
import {
  ActivityIndicator,
  View
} from 'react-native';
import PropTypes from 'prop-types';


/**
 * A simple loading indicator
 * 
 */
class Loading extends Component<Props> {

  render() {
    return (
      <ActivityIndicator 
        size="large" 
        color="#697689"
      />
    );
  }
};

export default Loading;