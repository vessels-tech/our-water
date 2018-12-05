import * as React from 'react';
import { Component } from 'react';
import { Text } from "react-native-elements";
import {  TextStyle, Linking } from "react-native";
import { maybeLog } from '../../utils';

export interface Props {
  style: TextStyle,
  text: string,
  url: string,
}

function goToURL(url: string) {
  Linking.canOpenURL(url)
  .then(supported => {
    if (supported) {
      Linking.openURL(url);
    } else {
      maybeLog("Cannot open url:", url);
    }
  });
}

export function Link(props: Props) {
  return (
    <Text
      numberOfLines={1}
      style={{ flex: 1, ...props.style}} 
      onPress={() => goToURL(props.url)}>
      {props.text}
    </Text>
  );
}