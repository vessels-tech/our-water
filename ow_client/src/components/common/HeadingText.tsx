import * as React from 'react'; import { Component } from 'react';
import { View, TouchableNativeFeedback } from "react-native";
import { Text } from 'react-native-elements';
import { surfaceText } from '../../utils/NewColors';

export interface Props {
  heading: string,
  content: string,
  onPress?: () => void
}

export default class HeadingText extends React.PureComponent<Props> {

  render() {
    const {heading, content} = this.props;

    return (
      <TouchableNativeFeedback
        onPress={() => this.props.onPress? this.props.onPress() : null}
      >
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          paddingVertical: 5,
          flexGrow: 1,
        }}>
          <Text style={{
            fontSize: 17,
            fontWeight: '700',
            color: surfaceText.high,
          }}>{heading}</Text>
          <Text style={{
            flex: 1,
            fontSize: 17,
            fontWeight: '100',
            paddingLeft: 50,
            color: surfaceText.high,
            flexWrap: 'wrap',
          }}>{content}</Text>
        </View>
      </TouchableNativeFeedback>
    );
  }
}