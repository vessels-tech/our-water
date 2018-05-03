import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  ScrollView,
  Text,
  View,
  TextInput,
  Dimensions,
  TouchableOpacity,
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
import DatePicker from 'react-native-datepicker'

import IconFormInput, { InputTypes } from '../components/common/IconFormInput';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

class NewReadingScreen extends Component<Props> {

  constructor(props) {
    super(props);

    this.state = {
      enableSubmitButton: false,
      date: new Date(),
      dateString: 'Today',
      measurementString: '',
    };
  }

  isDateValid() {
    return false;
  }

  isMeasurementValid() {
    const { measurementString } = this.props;

    //TODO: custom validation, eg. well depth
    return true;
  }

  getForm() {
    //TODO: get units from reading.metadata
    const units = 'metres';
    const { date, measurementString  } = this.state;

    return (
      <View style={{
        // backgroundColor: 'white',
        width: SCREEN_WIDTH - 30,
        // borderRadius: 10,
        // paddingTop: 32,
        // paddingBottom: 32,
        // alignItems: 'center',
        flexDirection: 'column'
      }}>

        <IconFormInput
          iconName='calendar'
          iconColor='#FF6767'
          placeholder='Reading Date'
          errorMessage={this.isDateValid() ? null : 'Invalid Date'}
          onChangeText={date => this.setState({date})}
          onSubmitEditing={() => console.log('on submit editing')}
          fieldType={InputTypes.dateTimeInput}
          value={date}
        />
        <IconFormInput
          iconName='pencil'
          iconColor='#FF6767'
          placeholder={`Measurement in ${units}`}
          errorMessage={this.isMeasurementValid() ? null : 'Invalid Measurement'}
          //TODO: fix
          onChangeText={measurementString => this.setState({ measurementString})}
          onSubmitEditing={() => console.log('on submit editing')}
          keyboardType='numeric'
          fieldType={InputTypes.fieldInput}
          value={measurementString}
        />

        {/* <FormInput
          icon="date"
          value={value}
          keyboardAppearance='light'
          autoFocus={false}
          autoCapitalize='none'
          autoCorrect={false}
          keyboardType='email-address'
          returnKeyType='done'
          inputStyle={{
            borderBottomColor: 'rgba(110, 120, 170, 1)',
            borderBottomWidth: 1,
            height: 45,
            marginVertical: 10,
          }}
          placeholder={`Reading (${units})`}
          containerStyle={{ marginTop: 15, borderBottomColor: 'rgba(0, 0, 0, 0.38)' }}
          ref={input => this.valueInput = input}
          onChangeText={value => this.setState({ value })}
          // errorMessage={isEmailValid ? null : 'Please enter a valid email address'}
        /> */}
      </View>
    );
  }

  shouldDisableSubmitButton() {
    const { date, measurement } = this.state;

    return true;
  }

  getButton() {

    return (
      <Button
        title='Save'
        disabled={this.shouldDisableSubmitButton()}
        icon={{ name: 'save' }}
        loading={false}
        loadingProps={{ size: 'small', color: 'white' }}
        buttonStyle={{ width: SCREEN_WIDTH - 30, backgroundColor: 'rgba(111, 202, 186, 1)', borderRadius: 5 }}
        titleStyle={{ fontWeight: 'bold', fontSize: 23 }}
        containerStyle={{ marginVertical: 10, height: 50, width: SCREEN_WIDTH - 30 }}
        onPress={() => console.log('aye')}
        underlayColor="transparent"
      />
    );
  }

  render() {

    return (
      <TouchableOpacity 
        style={{
          flex: 1,
          flexDirection: 'column',  
          width: '100%',
          height: '100%'
        }}
        onPress={() => {
          console.log("user touched me");
          return false;
        }}
      >
        <View style={{
          flex: 1,
          flexDirection: 'column',
          backgroundColor: '#D9E3F0',
          justifyContent: 'space-around',
          alignItems: 'center',
          width: '100%'
        }}>
          {this.getForm()}
          {this.getButton()}
        </View>
      </TouchableOpacity>
    );
  }
}

NewReadingScreen.propTypes = {
  resource: PropTypes.object.isRequired,
};

export default NewReadingScreen;