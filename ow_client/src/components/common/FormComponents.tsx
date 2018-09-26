import * as React from 'react';
import { Component } from "react";
import { View } from "react-native";
import { FormInput } from "react-native-elements";

export type TextInputParams = {
  handler: any,
  touched: boolean,
  hasError: boolean,
  meta: any,
}

export const TextInput = ({ meta, handler }: any) => (
  <View>
    <FormInput autoCapitalize={'none'} secureTextEntry={meta.secureTextEntry} placeholder={`${meta.label}`}{...handler()} />
  </View>
)