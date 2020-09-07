import * as React from 'react'; import { Component } from 'react';
import { Button } from "react-native-elements";

import withPreventDoubleClick from './withPreventDoubleClick';
import FlatIconButton from './FlatIconButton';
import { secondary } from '../../utils/NewColors';


export interface Props {
  title: string,
  onPress: () => any,
  buttonStyle?: any,
  iconName: string,
}

export function ResourceDetailBottomButton(props: Props) {
  return (
    <FlatIconButton
      style={{
        marginTop: 2,
        height: '100%',
        paddingLeft: 25,
      }}
      name={props.iconName}
      onPress={props.onPress}
      color={secondary}
      isLoading={false}
      size={32}
    />
  )

  // return (
  //   <ButtonEx
  //     color={secondary}
  //     containerViewStyle={{
  //       marginLeft: 0,
  //       marginRight: 0,
  //     }}
  //     buttonStyle={{
  //       paddingRight: 5,
  //       backgroundColor: bgLight,
  //       borderRadius: 5,
  //       flex: 1,
  //       marginTop: 6,
  //     }}
  //     title={props.title}
  //     onPress={props.onPress}
  //   />
  // )
}