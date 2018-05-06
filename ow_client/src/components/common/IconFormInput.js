import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  ScrollView,
  Text,
  View,
  TextInput,
  Dimensions,
} from 'react-native';
import PropTypes from 'prop-types';
import Icon from 'react-native-vector-icons/FontAwesome';
import {
  FormInput,
  Input,
  FormLabel,
  FormValidationMessage,
  Button
} from 'react-native-elements';
import DatePicker from 'react-native-datepicker';
import moment from 'moment';

import {
  getMinAndMaxReadingDates,
} from '../../utils'

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

const InputTypes = {
  fieldInput: 0,
  dateTimeInput: 1,
};

const dateFormat = 'MMMM Do YYYY, h: mm: ss a'

class IconFormInput extends Component<Props> {
  shouldDisplayErrorMessage() {
    const { errorMessage } = this.props;

    console.log("Error message", errorMessage);

    if (!errorMessage || errorMessage === '') {
      return false;
    }

    return true;
  }

  getFormInput(inputType) {
    switch(inputType) {
      case InputTypes.dateTimeInput:
        return this.getFormInputCalendar();
      case InputTypes.fieldInput:
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
          titleStyle={{ fontWeight: 'bold', fontSize: 23 }}
          containerStyle={{
            marginVertical: 10,
            height: 50,
            // width: '100%'
          }}
          onPress={() => {
            console.log('present cal');
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
          console.log('modalOnResponderTerminationRequest');
          return false;
        }}
        onDateChange={(date) => { this.setState({ date: date }) }}
        onOpenModal={() => {
          console.log('onOpenModal');
          return false;
        }}
        onCloseModal={() => console.log('onCloseModal')}
      />
    )
  }

  getFormInputField() {
    const { 
      iconName,
      placeholder,
      errorMessage,
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
        ref={input => this.dateInput = input}
        onSubmitEditing={() => onSubmitEditing()}
        onChangeText={text => onChangeText(text)}
      />
    )

  }

  render() {
    const {
      iconName,
      placeholder,
      errorMessage,
      onChangeText,
      onSubmitEditing,
      keyboardType,
      value,
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
          borderBottomColor: iconColor || 'rgba(110, 120, 170, 1)',
          borderBottomWidth: 1,
          marginTop: 15,
        }}>
          <Icon
            style={{
              // backgroundColor: 'blue',
              flex: 1,
            }}
            // reverse
            raised
            size={37}
            name={iconName}
            onPress={() => this.updateGeoLocation()}
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

IconFormInput.propTypes = {
  iconName: PropTypes.string,
  placeholder: PropTypes.string,
  errorMessage: PropTypes.string,
  keyboardType: PropTypes.string,
  value: PropTypes.any,
  onChangeText: PropTypes.func,
  onSubmitEditing: PropTypes.func,
  fieldType: PropTypes.number,
};

export default IconFormInput;

export {
  InputTypes, 
}