import * as React from 'react'; import { Component } from 'react';
import {
  View,
  KeyboardTypeOptions,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import {
  FormInput,
  FormValidationMessage,
  Button
} from 'react-native-elements';
import DatePicker from 'react-native-datepicker';

import {
  getMinAndMaxReadingDates,
} from '../../utils'
import { textDark } from '../../utils/Colors';

// const SCREEN_WIDTH = Dimensions.get('window').width;
// const SCREEN_HEIGHT = Dimensions.get('window').height;

export enum InputType {
  fieldInput,
  dateTimeInput,
};

const dateFormat = 'MMMM Do YYYY, h: mm: ss a'

export interface Props {
  errorMessage: string | null,
  value: any,
  iconName: string,
  placeholder: string,
  onChangeText: any,
  onSubmitEditing?: any,
  keyboardType?: KeyboardTypeOptions,
  iconColor: string,
  fieldType: InputType,
}

class IconFormInput extends Component<Props> {
  
  shouldDisplayErrorMessage() {
    const { errorMessage } = this.props;
    if (!errorMessage || errorMessage === '') {
      return false;
    }

    return true;
  }

  getFormInput(inputType: InputType) {
    switch(inputType) {
      case InputType.dateTimeInput:
        return this.getFormInputCalendar();
      case InputType.fieldInput:
        return this.getFormInputField();
    }
  }

  /**
   * This is a button which looks like a form input. It displays a date time picker
   * instead of a keyboard
   * 
   */
  dep_getFormInputCalendar() {
    const {
      value 
    } = this.props;

    return (
      <View style={{
        flex: 5,
      }}>
        <Button
          title={`${value}`}
          loading={false}
          buttonStyle={{
            // width: '100%',
            backgroundColor: 'transparent', 
          }}
          // titleStyle={{ fontWeight: 'bold', fontSize: 23 }}
          // containerStyle={{
          //   marginVertical: 10,
          //   height: 50,
          //   // width: '100%'
          // }}
          onPress={() => {
            return false; //stop propagation?
          }}
          underlayColor="transparent"
        />
      </View>
    );
  }
  
  getFormInputCalendar() {
    const { minDate, maxDate } = getMinAndMaxReadingDates(dateFormat);

    return (
      <DatePicker
        style={{ 
          // width: 200 
          flex: 5,
          borderWidth: 0,
          marginBottom: 10,
        }}
        showIcon={false}
        date={this.props.value}
        mode="datetime"
        placeholder="select date"
        format={dateFormat}
        minDate={minDate}
        maxDate={maxDate}
        //TODO: translate
        confirmBtnText="Confirm"
        cancelBtnText="Cancel"
        customStyles={{
          dateInput: {
            // marginLeft: 36
            borderWidth: 0,
        
          }
        }}
        modalOnResponderTerminationRequest={() => {
          return false;
        }}
        onDateChange={(date) => { this.setState({ date: date }) }}
        onOpenModal={() => {
          return false;
        }}
      />
    )
  }

  getFormInputField() {
    const { 
      placeholder,
      onChangeText,
      onSubmitEditing,
      keyboardType,
      value,
      iconColor,
    } = this.props;

    return (
      <FormInput
        value={value}
        keyboardAppearance='light'
        autoFocus={false}
        autoCapitalize='none'
        autoCorrect={false}
        keyboardType={keyboardType}
        returnKeyType='next'
        inputStyle={{
          // height: 45,
          // marginVertical: 10,
        }}
        placeholder={placeholder}
        containerStyle={{
          // backgroundColor: 'green',
          borderBottomColor: iconColor || 'rgba(0, 0, 0, 0.38)',
          flex: 5
        }}
        // ref={input => this.dateInput = input}
        onSubmitEditing={() => onSubmitEditing()}
        onChangeText={text => onChangeText(text)}
      />
    )

  }

  render() {
    const {
      iconName,
      errorMessage,
      iconColor,
      fieldType,
    } = this.props;

    return (
      <View style={{
        // backgroundColor: 'pink',
      }}>
        <View style={{
          // backgroundColor: 'red',
          flexDirection: 'row',
          borderBottomColor: textDark,
          borderBottomWidth: 1,
          marginTop: 15,
        }}>
          <Icon
            style={{
              // backgroundColor: 'blue',
              flex: 1,
            }}

            // raised
            size={37}
            name={iconName}
            // onPress={() => this.updateGeoLocation()}
            color={iconColor || "#FF6767"}
          />
          {this.getFormInput(fieldType)}
        </View>
        <FormValidationMessage
            style={{
              flex: 1,
              // backgroundColor: 'purple',
            }}
          >
            {errorMessage}
          </FormValidationMessage>
      </View>
    );
  }
}


export default IconFormInput;