import * as React from 'react'; import { Component } from 'react';
import {
  View,
} from 'react-native';
import { Icon } from 'react-native-elements';
import { primary, secondary, secondaryText } from '../../utils/Colors';
import { getLocation } from '../../utils';

export interface Props {
  onComplete?: any,
  onPress: any,
  color?: string,
  textColor?: string,
  name: string,
  style?: any,
}

export interface State {

}

export default class IconButton extends Component<Props> {

  constructor(props: Props) {
    super(props);
  }

  render() {
    return (
      <View style={{
        ...this.props.style,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 50,
        width: 45,
        height: 45,
      }}>
        <Icon
          reverse={true}
          raised={true}
          size={20}
          name={this.props.name}
          onPress={() => this.props.onPress()}
          color={this.props.color ? this.props.color : secondary}
          iconStyle={{
            color: this.props.textColor || secondaryText,
          }}
      />
      </View>
    );
  }
}
