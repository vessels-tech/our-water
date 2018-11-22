import * as React from 'react';
import { Component } from "react";
import { View, Picker } from "react-native";
import { FormInput, FormValidationMessage, FormLabel } from "react-native-elements";
import { bgLightHighlight } from '../../utils/Colors';
// @ts-ignore
import PhoneInput from 'react-native-phone-input'
import PhoneNumberEntry, { CallingCountry } from './PhoneNumberEntry';

export enum InputParams {
  Text = 'Text',
  Dropdown = 'Dropdown',
  Mobile = 'Mobile',
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

export type TextIdInputParams = {
  type: InputParams.Text,
  handler: any,
  touched: boolean,
  hasError: any,
  meta: {
    label: string,
    errorMessage: string,
    asyncErrorMessage: string,
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

export type MobileInputParams = {
  type: InputParams.Mobile,
  handler: any,
  meta: {
    label: string,
    asyncErrorMessage: string,
    //key is the actual value, label for translations
    options: { key: string, label: string }[],
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
export const TextIdInput = ({ meta, handler, hasError, touched }: any) => {

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
        {hasError('invalidId') && meta.asyncErrorMessage}
      </FormValidationMessage>
    </View>
  );
}


export const DropdownInput = (params: DropdownInputParams) => {
  const { type, handler, meta: { label, options }, errorMessage, hasError } = params;

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


export const MobileInput = (params: MobileInputParams) => {
  const { type, handler, meta: { asyncErrorMessage, label, options }, errorMessage, hasError } = params;

  console.log("handler() is:", handler());

  return (
    <View>
      <FormLabel>{label}</FormLabel>
      <PhoneNumberEntry 
        onValueChange={(mobileText: string) => {
          console.log("Phone number changed", mobileText)
          return handler().onChange(mobileText);
        }}
      />
      <FormValidationMessage>
        {hasError('invalidPhoneNumber') && asyncErrorMessage}
      </FormValidationMessage>
    </View>
  );
}