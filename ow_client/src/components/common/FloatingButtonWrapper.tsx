import * as React from 'react';
import { View } from 'react-native';

export interface Props {
  children: any
}

export default function FloatingButtonWrapper(props: Props) {
  return (
    <View
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'transparent'
      }}
    >
    {props.children}
    </View>
  );
}
