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
import { AppState } from '../../reducers';
import { connect } from 'react-redux';
import { primaryText } from '../../utils/Colors';
import { TranslationFile } from 'ow_translations';
import * as moment from 'moment';

export enum InputType {
  fieldInput,
  dateTimeInput,
};

export interface OwnProps {
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

export interface StateProps {
  translation: TranslationFile

}

export interface ActionProps {

}


class IconFormInput extends Component<OwnProps & StateProps & ActionProps> {
  
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
    const {
      calendar_input_confirm,
      calendar_input_cancel,
      long_date_format
    } = this.props.translation.templates;
    const { minDate, maxDate } = getMinAndMaxReadingDates(long_date_format);

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
        format={long_date_format}
        minDate={minDate}
        maxDate={maxDate}
        confirmBtnText={calendar_input_confirm}
        cancelBtnText={calendar_input_cancel}
        customStyles={{
          dateInput: {
            // marginLeft: 36
            borderWidth: 0,
          }
        }}
        modalOnResponderTerminationRequest={() => {
          return false;
        }}
        onDateChange={(date) => {
          this.props.onChangeText(moment(date, long_date_format));
          // this.setState({ date: date }) 
        }}
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
        underlineColorAndroid='transparent'
        inputStyle={{
          // height: 45,
          // marginVertical: 10,
        }}
        placeholder={placeholder}
        containerStyle={{
          borderBottomColor: iconColor || 'rgba(0, 0, 0, 0.38)',
          flex: 5
        }}
        // ref={input => this.dateInput = input}
        onSubmitEditing={() => onSubmitEditing && onSubmitEditing()}
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
      <View 
        style={{}}
      >
        <View style={{
          flexDirection: 'row',
          borderBottomColor: primaryText,
          borderBottomWidth: 1,
          marginTop: 15,
        }}>
          <Icon
            style={{
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

const mapStateToProps = (state: AppState, ownProps: OwnProps): StateProps => {
  return {
    translation: state.translation,
  }
}

const mapDispatchToProps = (dispatch: any): ActionProps => {
  return {};
}


export default connect(mapStateToProps, mapDispatchToProps)(IconFormInput);