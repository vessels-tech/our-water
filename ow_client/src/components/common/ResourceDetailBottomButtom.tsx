import * as React from 'react'; import { Component } from 'react';
import { secondary, bgLight } from "../../utils/Colors";
import { Button } from "react-native-elements";

import withPreventDoubleClick from './withPreventDoubleClick';
const ButtonEx = withPreventDoubleClick(Button);


export interface Props {
  title: string,
  onPress: () => any,
  buttonStyle?: any,
}

export function ResourceDetailBottomButton(props: Props) {
  return (
    <ButtonEx
      color={secondary}
      containerViewStyle={{
        marginLeft: 0,
        marginRight: 0,
      }}
      buttonStyle={{
        paddingRight: 5,
        backgroundColor: bgLight,
        borderRadius: 5,
        flex: 1,
        marginTop: 6,
      }}
      title={props.title}
      onPress={props.onPress}
    />
  )
}