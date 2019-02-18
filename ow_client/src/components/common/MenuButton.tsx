import * as React from 'react';
import { Component } from 'react';
import { TouchableNativeFeedback, View, Text } from 'react-native';
import { randomPrettyColorForId } from '../../utils';
import { primaryText } from '../../utils/Colors';

export interface Props {
  color?: string,
  name: string, 
  onPress: () => void,
}


export default function MenuButton(props: Props) {
  const { color, onPress, name } = props;

  return (
    <TouchableNativeFeedback
      style={{ flex: 1 }}
      onPress={() => onPress()}
    >
      <View style={{
        borderRadius: 2,
        elevation: 2,
        flex: 1,
        padding: 10,
        margin: 10,
        backgroundColor: color || randomPrettyColorForId(name),
      }}>
        <Text style={{ 
          fontWeight: '800', 
          fontSize: 20,
          fontFamily: 'Roboto',
          color: primaryText,
        }}>{name}</Text>
      </View>
    </TouchableNativeFeedback>
  );
}