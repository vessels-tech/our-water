import * as React from 'react';
import { Component } from "react";
import { View, Picker, StyleSheet } from "react-native";
import { FormValidationMessage, FormLabel, FormInput, Text, CheckBox } from "react-native-elements";
import { bgLightHighlight } from '../../utils/Colors';
// @ts-ignore
import PhoneInput from 'react-native-phone-input'
import PhoneNumberEntry, { CallingCountry } from './PhoneNumberEntry';
import { rightPad } from 'ow_common/lib/utils';
import HTMLView from 'react-native-htmlview';


export enum InputParams {
  Text = 'Text',
  Dropdown = 'Dropdown',
  Mobile = 'Mobile',
  TickHtml = 'TickHtml',
}

export type TextInputParams = {
  type: InputParams.Text,
  handler: any,
  touched: boolean,
  hasError: any,
  meta: {
    label: string,
    errorMessage: string,
    onFocus: () => void
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
    onFocus: () => void
  }
}

export type DropdownInputParams = {
  type: InputParams.Dropdown,
  handler: any,
  meta: {
    label: string,
    //key is the actual value, label for translations
    options: {key: string, label: string}[],
    defaultValue: string, //the default
  },
  hasError: (key: string) => boolean
  errorMessage: string,
}

export type MobileInputParams = {
  type: InputParams.Mobile,
  handler: any,
  touched: boolean,
  meta: {
    label: string,
    asyncErrorMessage: string,
    //key is the actual value, label for translations
    options: { key: string, label: string }[],
  },
  hasError: (key: string) => boolean
  errorMessage: string,
}


export type TickHtmlInputParams = {
  type: InputParams.TickHtml,
  handler: any,
  touched: boolean,
  meta: {
    label: string,
    errorMessage: string,
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
        {...handler()}
        autoCapitalize={'none'} 
        keyboardType={meta.keyboardType}
        onFocus={meta.onFocus}
        // placeholder={`${meta.label}`}
        secureTextEntry={meta.secureTextEntry} 
        editable={meta.editable}
        underlineColorAndroid='transparent'
        containerStyle={{
          borderBottomColor: bgLightHighlight,
          borderBottomWidth: 2,
        }}
      />
      <FormValidationMessage>
        {touched
          && hasError("required")
          && `${meta.label} ${meta.errorMessage}`}
        {touched
          && hasError("email")
          && `${meta.label} ${meta.errorMessage}`}
        {handler().value.length > 3 && hasError("invalid") && `${meta.asyncErrorMessage}`}
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
      {meta.editable? 
        <FormInput
          autoCapitalize={'none'} 
          keyboardType={meta.keyboardType}
          // placeholder={`${meta.label}`}
          secureTextEntry={meta.secureTextEntry}
          // editable={meta.editable}
          editable={false}
          underlineColorAndroid='transparent'
          containerStyle={{
            borderBottomColor: bgLightHighlight,
            borderBottomWidth: 2,
          }}
          {...handler()} 
        /> :
        <View 
          style={{
            borderBottomColor: bgLightHighlight,
            borderBottomWidth: 2,
            marginLeft: 20,
            paddingVertical: 10,
          }}>
          <Text>
            {handler().value}
          </Text>
        </View>
      }
      <FormValidationMessage style={{minHeight: 10}}>
        {touched
          && hasError("required")
          && `${meta.label} ${meta.errorMessage}`}
        {hasError('invalidId') && meta.asyncErrorMessage}
      </FormValidationMessage>
    </View>
  );
}


export const DropdownInput = (params: DropdownInputParams) => {
  const { type, handler, meta: { label, options, defaultValue }, errorMessage, hasError } = params;

  return (
    <View style={{
      width: '100%'
    }}>
      <FormLabel>{label}</FormLabel>
      <Picker
        selectedValue={handler().value || defaultValue}
        style={{
          marginLeft: 10,
        }}
        mode={'dropdown'}
        onValueChange={(e: any) => handler().onChange(e)}
      >
        {/* TD: hacky add right padding to the label to make the buttons easier to click */}
        {options.map(o => <Picker.Item key={o.key} label={rightPad(o.label, " ", 60)} value={o.key}/>)}
      </Picker>
      <FormValidationMessage>
        {hasError("required")
          && `${label} ${errorMessage}`}
      </FormValidationMessage>
    </View>
  );
}


export const MobileInput = (params: MobileInputParams) => {
  const { touched, type, handler, meta: { asyncErrorMessage, label, options }, errorMessage, hasError } = params;

  return (
    <View>
      <PhoneNumberEntry 
        value={handler().value}
        onValueChange={(mobileText: string) => {
          return handler().onChange(mobileText);
        }}
      />
      <FormValidationMessage>
        {touched && hasError("required") && `${label} ${errorMessage}`}
        {touched && hasError('invalidPhoneNumber') && asyncErrorMessage}
      </FormValidationMessage>
    </View>
  );
}

export const TickHtmlInput = (params: TickHtmlInputParams) => {
  const { touched, type, handler, meta: { errorMessage, label }, hasError } = params;
  const value = handler().value;
  
  const styles = StyleSheet.create({
    p: {
      flex: 5,
      textAlign: 'left',
      fontWeight: '300',
      alignSelf: 'center',
      // fontSize: 12,
    },
  });

  return (
    <View>
      <View style={{
          flexDirection: 'row', 
          flex: 1,
          justifyContent: 'space-between',
        }}>
        <HTMLView stylesheet={styles} value={label} />
        <CheckBox
          // iconRight={true}
          textStyle={{
            width: 0,
          }}
          checked={value}
          //Some mad hacking to get this looking ok.
          containerStyle={{
            maxWidth: 45,
            flex: 1,
            marginLeft: 2,
          }}
          onPress={() => handler().onChange(!value)}
        />
      </View>
      <FormValidationMessage>
        {touched && hasError("required") && `${errorMessage}`}
      </FormValidationMessage>
    </View>
  );
}