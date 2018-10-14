import * as React from 'react';
import { Component } from "react";
import { View } from "react-native";
import { FormInput, FormValidationMessage, FormLabel } from "react-native-elements";
import { textMed } from '../../utils/Colors';

export type TextInputParams = {
  handler: any,
  touched: boolean,
  hasError: any,
  meta: any,
}

export const TextInput = ({ meta, handler, hasError, touched }: TextInputParams) => (
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
        borderBottomColor: textMed,
        borderBottomWidth: 1,
      }}
      {...handler()} 
    />
    <FormValidationMessage>
      {touched
        && hasError("required")
        && `${meta.label} is required`}
    </FormValidationMessage>
  </View>
)