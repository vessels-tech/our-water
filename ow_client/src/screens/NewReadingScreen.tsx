import React, { Component } from 'react';
import {
  ScrollView,
  View,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native';
import { 
  Button 
} from 'react-native-elements';
import Config from 'react-native-config';
import moment, { Moment } from 'moment';


import IconFormInput,{ InputType } from '../components/common/IconFormInput';
import FirebaseApi from '../api/FirebaseApi';
import { displayAlert, getLocation } from '../utils';
import { bgLight, primary, primaryDark, textMed} from '../utils/Colors';

const SCREEN_WIDTH = Dimensions.get('window').width;
// const SCREEN_HEIGHT = Dimensions.get('window').height;
const orgId = Config.REACT_APP_ORG_ID;

export interface Props {
  resource: any,
  navigator: any
}

export interface State {
  measurementString: string,
  enableSubmitButton: boolean,
  date: Moment,
  isLoading: boolean,
  coords: any
}

class NewReadingScreen extends Component<Props> {
  state: State

  constructor(props: Props) {
    super(props);

    // const listener = FirebaseApi.pendingReadingsListener(orgId);

    this.state = {
      enableSubmitButton: false,
      date: moment(),
      measurementString: '',
      isLoading: false,
      coords: {},
    };
  }

  componentWillMount() {
    //Load the users location - don't inform user
    getLocation()
    .then((location: any) => {
      this.setState({coords: {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      }});
    })
    .catch(err => {
      console.log("could not get location");
    })
  }

  takeImage() {
    console.log("displaying image dialog");
  }

  saveReading() {
    const {date, measurementString, coords} = this.state;
    const { resource: { id } } = this.props;

    this.setState({isLoading: true});

    const reading = {
      datetime: moment(date).format(), //converts to iso string
      resourceId: id,
      value: measurementString, //joi will take care of conversions for us
      userId: "12345", //TODO get the userId
      imageUrl: "http://placekitten.com/g/200/300",
      coords
    };

    return FirebaseApi.saveReadingPossiblyOffline(orgId, reading)
    .then(() => {
      //TODO: display toast or something
      this.setState({
        date: moment(),
        measurementString: '',
        isLoading: false
      });

      displayAlert(
        'Success', `Reading saved.`,
        [
          { text: 'One More', onPress: () => console.log('continue pressed') },
          { text: 'Done', onPress: () => this.props.navigator.pop() },
        ]
      );
    })
    .catch((err: Error) => {
      console.log(err);
      //TODO: display error
      this.setState({
        isLoading: false
      });

      displayAlert(
        'Error',
         `Couldn't save your reading. Please try again.`,
         [{ text: 'OK', onPress: () => console.log('continue pressed') },]
      );
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

      if (isNaN(measurement)) {
        isValid = false;
      }
    } catch(err) {
      isValid = false;
    }

    //TODO: custom validation, eg. well depth
  
    return isValid;
  }

  getImageSection() {
    return (
      <View style={{
        height: 150,
        backgroundColor: primaryDark,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <Button
          title="Add an Image"
          raised
          icon={{ name: 'camera' }}
          buttonStyle={{
            backgroundColor: primary,
          }}
          // titleStyle={{
          //   fontWeight: 'bold',
          //   fontSize: 23,
          // }}
          // containerStyle={{
          // }}
          onPress={() => this.takeImage()}
          underlayColor="transparent"
        />

      </View>
    );
  }

  getForm() {
    //TODO: get units from reading.metadata
    const units = 'metres';
    const { date, measurementString  } = this.state;

    return (
      <View style={{
        flex: 1,
        width: '100%',
        paddingHorizontal: 20,
        marginTop: 10,
        flexDirection: 'column'
      }}>
        {this.getImageSection()}
        <IconFormInput
          iconName='calendar'
          iconColor={textMed}
          placeholder='Reading Date'
          errorMessage={this.isDateValid() ? null : 'Invalid Date'}
          onChangeText={(date: Moment) => this.setState({date})}
          onSubmitEditing={() => console.log('on submit editing')}
          fieldType={InputType.dateTimeInput}
          value={date}
        />
        <IconFormInput
          iconName='pencil'
          iconColor={textMed}
          placeholder={`Measurement in ${units}`}
          errorMessage={
            measurementString.length > 0 && !this.isMeasurementValid() ? 
              'Invalid Measurement' : null
          }
          onChangeText={(measurementString: string) => this.setState({ measurementString})}
          onSubmitEditing={() => console.log('on submit editing')}
          keyboardType='numeric'
          fieldType={InputType.fieldInput}
          value={measurementString}
        />
      </View>
    );
  }

  shouldDisableSubmitButton() {
    return this.state.isLoading ||
           !this.isDateValid() ||
           !this.isMeasurementValid();
  }

  getButton() {
    return (
      <Button
        title='Save'
        raised
        disabled={this.shouldDisableSubmitButton()}
        icon={{ name: 'save' }}
        loading={this.state.isLoading}
        // loadingProps={{ size: 'small', color: 'white' }}
        buttonStyle={{ 
          backgroundColor: primary,
          // borderRadius: 5,
          width: SCREEN_WIDTH - 20,
          // marginBottn: 20
        }}
        // disabledStyle={{
        //   backgroundColor: primaryDark, 
        // }}
        // titleStyle={{ 
        //   fontWeight: 'bold',
        //   fontSize: 23,
        // }}
        // containerStyle={{         
        
        // }}
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
          return false;
        }}
      >
        <ScrollView style={{
          flex: 1,
          flexDirection: 'column',
          backgroundColor: bgLight,
          // justifyContent: 'space-around',
          // alignItems: 'center',
          width: '100%',
          marginBottom: 40,
        }}>
          {this.getForm()}
          {this.getButton()}
        </ScrollView>
      </TouchableWithoutFeedback>
    );
  }
}

export default NewReadingScreen;