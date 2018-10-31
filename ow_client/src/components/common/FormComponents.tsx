import * as React from 'react';
import { Component } from "react";
import { View, Picker } from "react-native";
import { FormInput, FormValidationMessage, FormLabel } from "react-native-elements";
import { bgLightHighlight } from '../../utils/Colors';

export enum InputParams {
  Text = 'Text',
  Dropdown = 'Dropdown',
}

export type TextInputParams = {
  type: InputParams.Text,
  handler: any,
  touched: boolean,
  hasError: any,
  meta: {
    label: string,
    errorMessage: string,
  }
}

export type DropdownInputParams = {
  type: InputParams.Dropdown,
  handler: any,
  meta: {
    label: string,
    //key is the actual value, label for translations
    options: {key: string, label: string}[],
  },
  hasError: (key: string) => boolean
  errorMessage: string,
}

export const TextInput = ({ meta, handler, hasError, touched }: any) => {

  return (
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
          && `${meta.label} ${meta.errorMessage}`}
      </FormValidationMessage>
    </View>
  );
}


export const DropdownInput = (params: DropdownInputParams) => {
  const { type, handler, meta: { label, options }, errorMessage, hasError } = params;

  console.log('handler.getHandler is: ', handler);
  console.log('handler() is: ', handler());

  return (
    <View style={{
      flex: 1,
    }}>
      <FormLabel>{label}</FormLabel>
      <Picker
        selectedValue={handler().value}
        style={{
          flex: 2,
          marginLeft: 10,
        }}
        mode={'dropdown'}
        onValueChange={(e: any) => handler().onChange(e)}
      >
        {options.map(o => <Picker.Item key={o.key} label={o.label} value={o.key} />)}
      </Picker>
      <FormValidationMessage>
        {hasError("required")
          && `${label} ${errorMessage}`}
      </FormValidationMessage>
    </View>
  );
}