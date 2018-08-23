import * as React from 'react'; import { Component } from 'react';
import {
  Image,
} from 'react-native';

export interface Props {
  
}

export default class ResourceMarker extends Component<Props> {

  render() {
    return (
      <Image
        source={require('../../assets/blue_marker.png')}
      />
    );
  }
}