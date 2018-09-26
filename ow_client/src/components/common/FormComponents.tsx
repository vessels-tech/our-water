import * as React from 'react';
import { Component } from "react";
import { View } from "react-native";
import { FormInput, FormValidationMessage } from "react-native-elements";

export type TextInputParams = {
  handler: any,
  touched: boolean,
  hasError: any,
  meta: any,
}

export const TextInput = ({ meta, handler, hasError, touched }: TextInputParams) => (
  <View>
    <FormInput 
      autoCapitalize={'none'} 
      keyboardType={meta.keyboardType}
      placeholder={`${meta.label}`}{...handler()} 
      secureTextEntry={meta.secureTextEntry} 
    />
    <FormValidationMessage>
      {touched
        && hasError("required")
        && `${meta.label} is required`}
    </FormValidationMessage>
  </View>
)