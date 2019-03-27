import * as React from 'react'
import { StyleProp, TextStyle, View } from 'react-native';
import { Text } from 'react-native-elements';
import { Dimensions } from "react-native";
const { fontScale } = Dimensions.get("window");

export interface Props {
  title: string,
  color: string,
  opacity: number,
}

const LegendEntry = ({title, color, opacity}: Props) => {
  const legendBoxDefaultStyle = { height: 20, width: 20 };
  const textDefaultStyle: StyleProp<TextStyle> = { 
    fontWeight: '500',
    fontSize: 10 / fontScale,
  };

  return (
    <View
      style={{
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center'
      }}
    >
      <Text 
        allowFontScaling={false}
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