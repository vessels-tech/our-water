import * as React from 'react'; import { Component } from 'react';
import {
  View, TouchableNativeFeedback,
} from 'react-native';
import { Icon, Text, Button } from 'react-native-elements';
import { primary, secondary, secondaryText } from '../../utils/Colors';
import { getLocation } from '../../utils';

export interface Props {
  onComplete?: any,
  onPress: any,
  color?: string,
  textColor?: string,
  name: string,
  style?: any,
  bottomText?: string,
  size?: number
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
        margin: 20,
      }}>
        <View
          style={{
            backgroundColor: this.props.color ? this.props.color : secondary,
            borderRadius: 50,
            elevation: 5,
            margin: 10,
          }}
        >
          <TouchableNativeFeedback
            background={TouchableNativeFeedback.Ripple('grey', true)}
            onPress={() => this.props.onPress()}
          >
            <Icon
              reverse={true}
              underlayColor={'purple'}
              size={this.props.size ? this.props.size : 20}
              name={this.props.name}
              color={this.props.color ? this.props.color : secondary}
              iconStyle={{
                color: this.props.textColor || secondaryText,
              }}
            />
          </TouchableNativeFeedback>
        </View>
      {this.props.bottomText &&
        <Text
          style={{fontWeight: '400', fontSize: 12}}
        >{this.props.bottomText}</Text>
      }
      </View>
    );
  }
}
