import * as React from 'react'; import { Component } from 'react';
import { View, TouchableNativeFeedback } from "react-native";
import { Text } from 'react-native-elements';

export interface Props {
  heading: string,
  content: string,
  subtitle: string,
  onPress?: () => void
}

export default class HeadingText extends React.PureComponent<Props> {

  render() {
    const {heading, content, subtitle} = this.props;

    return (
      <TouchableNativeFeedback
        onPress={() => this.props.onPress? this.props.onPress() : null}
      >
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          paddingVertical: 5,
        }}>
          <View
            style={{
              flexDirection: 'column',
            }}
          >
            <Text style={{fontSize: 17, fontWeight: '700' }}>{heading}</Text>
            <Text style={{ fontSize: 10, fontWeight: '100', fontStyle: "italic" }}>{subtitle}</Text>
          </View>
          <Text style={{ fontSize: 17, fontWeight: '100', paddingLeft: 50 }}>{content}</Text>
        </View>
      </TouchableNativeFeedback>
    );
  }
}