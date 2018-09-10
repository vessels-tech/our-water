import * as React from 'react'; import { Component } from 'react';
import { View } from "react-native";
import { Text } from 'react-native-elements';

export interface Props {
  heading: string,
  content: string,
}

export default class HeadingText extends React.PureComponent<Props> {

  render() {
    const {heading, content} = this.props;

    return (
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
      }}>
        <Text style={{ fontSize: 17, fontWeight: '700', }}>{heading}</Text>
        <Text style={{ fontSize: 17, fontWeight: '100', paddingLeft: 50 }}>{content}</Text>
      </View>
    );
  }
}