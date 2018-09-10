import * as React from 'react'; import { Component } from 'react';
import {
  ScrollView,
  View,
  Dimensions,
  TouchableWithoutFeedback,
  Picker,
  Keyboard,
} from 'react-native';
import { 
  Button, Text 
} from 'react-native-elements';
import Config from 'react-native-config';
import * as moment from 'moment';

import IconFormInput,{ InputType } from '../components/common/IconFormInput';
import FirebaseApi from '../api/FirebaseApi';
import { displayAlert, getLocation } from '../utils';
import { bgLight, primary, primaryDark, textMed} from '../utils/Colors';
import { ConfigFactory } from '../config/ConfigFactory';
import BaseApi from '../api/BaseApi';
import { Reading, Resource, SaveReadingResult } from '../typings/models/OurWater';
import { validateReading } from '../api/ValidationApi';
import { AppContext } from '../AppProvider';

const SCREEN_WIDTH = Dimensions.get('window').width;
// const SCREEN_HEIGHT = Dimensions.get('window').height;
const orgId = Config.REACT_APP_ORG_ID;

export interface Props {
  resource: Resource,
  navigator: any,

  //Injected by Consumer
  config: ConfigFactory,
  userId: string,
  appApi: BaseApi,
}

export interface State {
  measurementString: string,
  timeseriesString: string,
  enableSubmitButton: boolean,
  date: moment.Moment,
  isLoading: boolean,
  coords: any
}

class NewReadingScreen extends Component<Props> {
  state: State;

  constructor(props: Props) {
    super(props);

    let timeseriesString = '';
    if (this.props.resource.timeseries[0]) {
      timeseriesString = this.props.resource.timeseries[0].id;
    }

    this.state = {
      enableSubmitButton: false,
      date: moment(),
      measurementString: '',
      timeseriesString,
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
    Keyboard.dismiss();
    const {date, measurementString, coords, timeseriesString} = this.state;
    const { resource: { id } } = this.props;

    this.setState({isLoading: true});


    const readingRaw = {
      date: moment(date).utc().format(), //converts to iso string
      timeseriesId: timeseriesString, 
      resourceId: id,
      value: measurementString, //joi will take care of conversions for us
      userId: this.props.userId,
      imageUrl: "http://placekitten.com/g/200/300",
      coords
    };

    return validateReading(readingRaw)
    .then(reading => this.props.appApi.saveReading(orgId,this.props.userId, reading))
    //TODO: catch not logged in error
    .then((r: SaveReadingResult) => {
      this.setState({
        date: moment(),
        measurementString: '',
        isLoading: false
      });

      let message = `Reading saved.`;

      if (r.requiresLogin) {
        //Reading was saved, but pending sync
        message = `Reading saved locally. Login to save to GGMN.`;
      }

      displayAlert(
        'Success', message,
        [
          //TODO: add a new button to take the user to the login page?
          { text: 'One More', onPress: () => {} },
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
         [{ text: 'OK', onPress: () => {} }]
      );
    });
  }

  isDateValid() {
    //Date is controlled by date picker, can't really be invalid
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

  isTimeseriesValid() {
    const { timeseriesString } = this.state;
    if (!timeseriesString || timeseriesString.length === 0) {
      return false;
    }

    return true;
  }

  getImageSection() {
    if (!this.props.config.getNewReadingShouldShowImageUpload()) {
      return null;
    }

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
    const { resource } = this.props;

    return (
      <View style={{
        flex: 1,
        width: '100%',
        paddingHorizontal: 20,
        marginTop: 10,
        flexDirection: 'column',
        paddingBottom: 10,
      }}>
        {this.getImageSection()}
        <IconFormInput
          iconName='calendar'
          iconColor={textMed}
          placeholder='Reading Date'
          errorMessage={this.isDateValid() ? null : 'Invalid Date'}
          onChangeText={(date: moment.Moment) => this.setState({date})}
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
        <View style={{
          flexDirection: "row"
        }}>
          <Text>Timeseries:</Text>
          <Picker
            selectedValue={this.state.timeseriesString}
            style={{ width: '100%', backgroundColor: 'red' }}
            mode={'dropdown'}
            onValueChange={(itemValue) => this.setState({ timeseriesString: itemValue })
            }>
            {resource.timeseries.map(ts => <Picker.Item key={ts.id} label={ts.name} value={ts.id}/>)}
          </Picker>
        </View>
      </View>
    );
  }

  shouldDisableSubmitButton() {
    return this.state.isLoading ||
           !this.isDateValid() ||
           !this.isMeasurementValid() ||
           !this.isTimeseriesValid();
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
          paddingHorizontal: 10,
        }}
          keyboardShouldPersistTaps={'always'}
        >
          {this.getForm()}
          {this.getButton()}
        </ScrollView>
      </TouchableWithoutFeedback>
    );
  }
}

const NewReadingScreenWithContext = (props: Props) => {
  return (
    <AppContext.Consumer>
      {({ appApi, userId, config }) => (
        <NewReadingScreen
          appApi={appApi}
          userId={userId}
          config={config}
          {...props}
        />
      )}
    </AppContext.Consumer>
  );
}

export default NewReadingScreenWithContext;