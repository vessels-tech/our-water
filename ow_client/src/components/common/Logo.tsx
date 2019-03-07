import * as React from 'react'; import { Component } from 'react';

import { Text } from 'react-native-elements';
import { primaryDark, secondaryDark } from '../../utils/NewColors';
import { View, StyleSheet } from "react-native";
import HTMLView from 'react-native-htmlview';


export interface Props {
  text: string,
  aboutHtml: string,
}

const Logo = (props: Props) => {
  const { text, aboutHtml } = props;

  console.log("AboutHTML is", aboutHtml);

  const styles = StyleSheet.create({
    p: {
      textAlign: 'center',
    },
    a: {
      fontWeight: '300',
      color: primaryDark, // make links coloured pink
    },
  });

  return (
    <View style={{
      // width: '100%',
      height: 90,
      backgroundColor: secondaryDark,
      justifyContent: 'center',
      alignContent: 'center',
    }}>
      <Text style={{fontSize: 35, fontWeight: '700', textAlign: 'center', paddingTop: 20}}>{text}</Text>
      {<HTMLView stylesheet={styles} value={aboutHtml} />}
    </View>
  );
}

export default Logo;