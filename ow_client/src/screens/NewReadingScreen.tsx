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
import * as moment from 'moment';

import IconFormInput,{ InputType } from '../components/common/IconFormInput';
import { displayAlert, getLocation, maybeLog } from '../utils';
import { bgLight, primary, primaryDark, secondary, secondaryText, primaryText} from '../utils/Colors';
import { ConfigFactory } from '../config/ConfigFactory';
import BaseApi from '../api/BaseApi';
import { Reading, Resource, SaveReadingResult } from '../typings/models/OurWater';
import { validateReading } from '../api/ValidationApi';
import { ResultType, SomeResult } from '../typings/AppProviderTypes';
import * as appActions from '../actions';
import { AppState } from '../reducers';
import { connect } from 'react-redux'
import { SyncMeta } from '../typings/Reducer';
import ExternalServiceApi from '../api/ExternalServiceApi';
import { TranslationFile } from 'ow_translations/Types';

const SCREEN_WIDTH = Dimensions.get('window').width;

export interface Props {
  resource: Resource,
  navigator: any,
  config: ConfigFactory,
  userId: string,
  appApi: BaseApi,

  saveReading: any,
  pendingSavedReadingsMeta: SyncMeta,
  translation: TranslationFile,
}

export interface State {
  measurementString: string,
  timeseriesString: string,
  enableSubmitButton: boolean,
  date: moment.Moment,
  coords: any
}

class NewReadingScreen extends Component<Props> {
  state: State;
  appApi: BaseApi;
  externalApi: ExternalServiceApi;

  constructor(props: Props) {
    super(props);

    //@ts-ignore
    this.appApi = props.config.getAppApi();
    this.externalApi = props.config.getExternalServiceApi();

    let timeseriesString = '';
    if (this.props.resource.timeseries[0]) {
      timeseriesString = this.props.resource.timeseries[0].id;
    }

    this.state = {
      enableSubmitButton: false,
      date: moment(),
      measurementString: '',
      timeseriesString,
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
      maybeLog("could not get location");
    })
  }

  takeImage() {
    maybeLog("TOOD: display image");
  }

  async saveReading() {
    Keyboard.dismiss();
    const {date, measurementString, coords, timeseriesString} = this.state;
    const { 
      pendingSavedReadingsMeta: {loading},
      resource: { id },
      translation: { templates: { 
        new_reading_invalid_error_heading, 
        new_reading_invalid_error_description,
        new_reading_invalid_error_ok,
        new_reading_unknown_error_heading,
        new_reading_unknown_error_description,
        new_reading_unknown_error_ok,
        new_reading_saved_popup_title,
        new_reading_saved,
        new_reading_warning_login_required,
        new_reading_dialog_one_more,
        new_reading_dialog_done,
      }}
    } = this.props;

    if (loading) {
      //Don't allow a double button press!
      return;
    }

    const readingRaw = {
      date: moment(date).utc().format(), //converts to iso string
      timeseriesId: timeseriesString, 
      resourceId: id,
      value: measurementString, //joi will take care of conversions for us
      userId: this.props.userId,
      imageUrl: "http://placekitten.com/g/200/300",
      coords
    };

    const validateResult = await validateReading(readingRaw);
    if (validateResult.type === ResultType.ERROR) {
      displayAlert(
        new_reading_invalid_error_heading,
        new_reading_invalid_error_description,
        [{ text: new_reading_invalid_error_ok, onPress: () => { } }]
      );

      return;
    }

    const saveResult: SomeResult<SaveReadingResult> = await this.props.saveReading(this.appApi, this.externalApi, this.props.userId, id, validateResult.result);

    //TODO: how to do callbacks from state?
    if (saveResult.type === ResultType.ERROR) {
      displayAlert(
        new_reading_unknown_error_heading,
        new_reading_unknown_error_description,
        [{ text: new_reading_unknown_error_ok, onPress: () => { } }]
      );

      return;
    }

    this.setState({
      date: moment(),
      measurementString: '',
    });

    let message = new_reading_saved;
    if (saveResult.result.requiresLogin) {
      message = new_reading_warning_login_required;
    }

    displayAlert(
      new_reading_saved_popup_title,
      message,
      [
        { text: new_reading_dialog_one_more, onPress: () => { } },
        { text: new_reading_dialog_done, onPress: () => this.props.navigator.pop() },
      ]
    );
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
    const { resource, translation: { templates: {
      new_reading_date_field,
      new_reading_date_field_invalid,
      new_reading_value_field,
      new_reading_value_field_invalid,
      new_reading_timeseries,
    }}} = this.props;

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
          iconColor={primaryDark}
          placeholder={new_reading_date_field}
          errorMessage={this.isDateValid() ? null : new_reading_date_field_invalid}
          onChangeText={(date: moment.Moment) => this.setState({date})}
          fieldType={InputType.dateTimeInput}
          value={date}
        />
        <IconFormInput
          iconName='pencil'
          iconColor={primaryDark}
          placeholder={new_reading_value_field(units)}
          errorMessage={
            measurementString.length > 0 && !this.isMeasurementValid() ? 
              new_reading_value_field_invalid : null
          }
          onChangeText={(measurementString: string) => this.setState({ measurementString})}
          keyboardType='numeric'
          fieldType={InputType.fieldInput}
          value={measurementString}
        />
        <View style={{
          flexDirection: "row",
          borderBottomColor: primaryText,
          borderBottomWidth: 1,
        }}>
          <Text 
          style={{
            alignSelf:'center',
            paddingRight: 10,
            fontSize: 15,
            fontWeight: '600', 
            flex: 1,
          }}>
            {`${new_reading_timeseries}:`}
          </Text>
          <Picker
            selectedValue={this.state.timeseriesString}
            style={{
              flex: 2
              // width: '100%',
              // backgroundColor: 'red' 
            }}
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
    return this.props.pendingSavedReadingsMeta.loading ||
           !this.isDateValid() ||
           !this.isMeasurementValid() ||
           !this.isTimeseriesValid();
  }

  getButton() {
    const { 
      pendingSavedReadingsMeta: { loading },
      translation: { templates: {
        new_reading_save_button
      }}
    } = this.props;

    return (
      <Button
        title={new_reading_save_button}
        raised
        textStyle={{
          color: secondaryText
        }}
        disabled={this.shouldDisableSubmitButton()}
        icon={{ name: 'save', color: secondaryText }}
        loading={loading}
        buttonStyle={{
          backgroundColor: secondary,
          width: SCREEN_WIDTH - 20,
        }}
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

const mapStateToProps = (state: AppState) => {

  return {
    pendingSavedReadingsMeta: state.pendingSavedReadingsMeta,
    translation: state.translation,
  }
}

const mapDispatchToProps = (dispatch: any) => {
  return {
    saveReading: (api: BaseApi, externalApi: ExternalServiceApi, userId: string, resourceId: string, reading: Reading) => 
      { return dispatch(appActions.saveReading(api, externalApi, userId, resourceId, reading))}
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(NewReadingScreen);