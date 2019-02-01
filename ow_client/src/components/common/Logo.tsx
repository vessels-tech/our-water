import * as React from 'react'; import { Component } from 'react';

import { View, Image } from "react-native";
import { secondaryDark } from '../../utils/Colors';
import { Text } from 'react-native-elements';


const Logo = (text: string) => {
  return (
    <View style={{
      width: '100%',
      height: 90,
      backgroundColor: secondaryDark,
      justifyContent: 'center',
      alignContent: 'center',
    }}>
      <Text style={{fontSize: 35, fontWeight: '700', textAlign: 'center', paddingTop: 20}}>{text}</Text>
      {/* <Image
        style={{
          // backgroundColor: 'tomato',
          height: 150,
          width: 160,
          alignSelf: 'center',
          // width: '50%',
          // padding: 20,
        }}
        // source={{ uri: 'asset:/splash.png'}}
        source={require('../../assets/ggmn_logo.png')}
      /> */}

      {/* <Image source={{ uri: 'https://facebook.github.io/react/logo-og.png' }}
              style={{ width: 400, height: 400 }}
            /> */}

      {/* <View style={{
              alignSelf: 'center',
              marginTop: 25,
              width: 100,
              height: 100,
              backgroundColor: secondary,
            }}/> */}
    </View>
  );
}

export default Logo;