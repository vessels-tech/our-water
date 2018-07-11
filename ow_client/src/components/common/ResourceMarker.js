import React, { Component } from 'react';
import {
  ActivityIndicator,
  Text,
  View,
  TextInput,
  Image,
} from 'react-native';
import { Button, Icon } from 'react-native-elements';
import PropTypes from 'prop-types';

import { ResourceTypes } from '../../enums';


class ResourceMarker extends Component<Props> {

  constructor(props) {
    super(props);
  }

  // getIconForResourceType() {
  //   const { resourceType } = this.props;

  //   return null;
  // }

  render() {
    return (
      <Image
        source={require('../../assets/blue_marker.png')}
      />
    );
  }
}