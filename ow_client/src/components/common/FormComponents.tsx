import * as React from 'react';
import { Component } from "react";
import { View } from "react-native";
import { FormInput, FormValidationMessage, FormLabel } from "react-native-elements";
import { bgLightHighlight } from '../../utils/Colors';

export type TextInputParams = {
  handler: any,
  touched: boolean,
  hasError: any,
  meta: any,
  errorMessage: string,
}

export const TextInput = ({ meta, handler, hasError, touched, errorMessage }: any) => (
  <View style={{
    flex: 1,
  }}>
    <FormLabel>{meta.label}</FormLabel>
    <FormInput
      autoCapitalize={'none'} 
      keyboardType={meta.keyboardType}
      // placeholder={`${meta.label}`}
      secureTextEntry={meta.secureTextEntry} 
      editable={meta.editable}
      underlineColorAndroid='transparent'
      containerStyle={{
        borderBottomColor: bgLightHighlight,
        borderBottomWidth: 2,
      }}
      {...handler()} 
    />
    <FormValidationMessage>
      {touched
        && hasError("required")
        && `${meta.label} ${errorMessage}`}
    </FormValidationMessage>
  </View>
)