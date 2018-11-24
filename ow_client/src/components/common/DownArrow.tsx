import * as React from 'react'; import { Component } from 'react';

import { Icon } from 'react-native-elements';
import { primary, bgLight, primaryText, secondaryText } from '../../utils/Colors';


const DownArrow = () => (
  <Icon
    size={40}
    name={'arrow-downward'}
    onPress={() => this.props.onPress()}
    color={secondaryText}
    iconStyle={{
      color: secondaryText,
    }}
  />
)

export default DownArrow;