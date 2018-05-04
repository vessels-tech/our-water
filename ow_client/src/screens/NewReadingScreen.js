import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  ScrollView,
  Text,
  View,
  TextInput,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native';
import PropTypes from 'prop-types';
import Icon from 'react-native-vector-icons/FontAwesome';
import { 
  FormInput, 
  Input,
  FormLabel,
  FormValidationMessage, 
  // Button 
} from 'react-native-elements';
import DatePicker from 'react-native-datepicker'
import Config from 'react-native-config';


import IconFormInput, { InputTypes } from '../components/common/IconFormInput';
import FirebaseApi from '../api/FirebaseApi';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;
const orgId = Config.REACT_APP_ORG_ID;

class NewReadingScreen extends Component<Props> {

  constructor(props) {
    super(props);

    this.state = {
      enableSubmitButton: false,
      date: new Date(),
      measurementString: '',
    };
  }

  saveReading() {
    const {date, measurementString} = this.state;
    const { resource: { id } } = this.props;
    const reading = {
      datetime: date,
      resourceId: id,
      value: measurementString, //joi will take care of conversions for us
      userId: "12345", //TODO get the userId
    };

    return FirebaseApi.saveReading({orgId, reading})
    .then(result => {
      console.log(result);
      //TODO: display toast or something

      this.setState({
        date: new Date(),
        measurementString: '',
      });
    })
    .catch(err => {
      console.log(err);
      //TODO: display error
    });
  }

  isDateValid() {
    //Date is controlled by date picker, can't really be valid
    return true;
  }

  isMeasurementValid() {
    const { measurementString } = this.state;

    let isValid = true;
    
    try {
      let measurement = parseFloat(measurementString);
      console.log(measurementString, measurement);

      if (isNaN(measurement)) {
        isValid = false;
      }
    } catch(err) {
      isValid = false;
    }

    //TODO: custom validation, eg. well depth
  
    return isValid;
  }

  getForm() {
    //TODO: get units from reading.metadata
    const units = 'metres';
    const { date, measurementString  } = this.state;

    return (
      <View style={{
        width: SCREEN_WIDTH - 30,
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
          errorMessage={
            measurementString.length > 0 && !this.isMeasurementValid() ? 
              'Invalid Measurement' : null
          }
          onChangeText={measurementString => this.setState({ measurementString})}
          onSubmitEditing={() => console.log('on submit editing')}
          keyboardType='numeric'
          fieldType={InputTypes.fieldInput}
          value={measurementString}
        />
      </View>
    );
  }

  shouldDisableSubmitButton() {
    return !this.isDateValid() || !this.isMeasurementValid();
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
        onPress={() => this.saveReading()}
        underlayColor="transparent"
      />
    );
  }

  render() {

    return (
      /*
      Wrap in a touchable to stop events propagating to the parent screen
      */
      <TouchableWithoutFeedback 
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
      </TouchableWithoutFeedback>
    );
  }
}

NewReadingScreen.propTypes = {
  resource: PropTypes.object.isRequired,
};

export default NewReadingScreen;