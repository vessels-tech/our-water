import * as React from 'react'
import { StyleProp, TextStyle, View } from 'react-native';
import { Text } from 'react-native-elements';


export interface Props {
  title: string,
  color: string,
  opacity: number,
}

const LegendEntry = ({title, color, opacity}: Props) => {
  const legendBoxDefaultStyle = { height: 20, width: 20 };
  const textDefaultStyle: StyleProp<TextStyle> = { fontWeight: '500' };

  return (
    <View
      style={{
        flex: 1,
        flexDirection: 'row'
      }}
    >
      <Text 
        style={{
          ...textDefaultStyle 
        }}
      >
        {title}
      </Text>
      <View 
        style={{
          ...legendBoxDefaultStyle,
          backgroundColor: color,
          opacity,
          marginLeft: 10,
        }} 
      />
    </View>
  );
}

export default LegendEntry;