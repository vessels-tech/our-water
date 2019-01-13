import * as React from 'react'; import { Component } from 'react';
import {
  ScrollView,
  View,
  Dimensions,
  TouchableWithoutFeedback,
  Picker,
  Keyboard,
  Image,
} from 'react-native';
import { 
  Button, Text 
} from 'react-native-elements';
import * as moment from 'moment';

import IconFormInput,{ InputType } from '../components/common/IconFormInput';
import { displayAlert, maybeLog, showModal, unwrapUserId } from '../utils';
import { bgLight, primary, primaryDark, secondary, secondaryText, primaryText} from '../utils/Colors';
import { ConfigFactory } from '../config/ConfigFactory';
import BaseApi from '../api/BaseApi';
import { Reading, SaveReadingResult } from '../typings/models/OurWater';
import { validateReading } from '../api/ValidationApi';
import { ResultType, SomeResult } from '../typings/AppProviderTypes';
import * as appActions from '../actions';
import { AppState } from '../reducers';
import { connect } from 'react-redux'
import { SyncMeta, ActionMeta } from '../typings/Reducer';
import { MaybeExternalServiceApi } from '../api/ExternalServiceApi';
import { TranslationFile } from 'ow_translations';
import { AnyResource } from '../typings/models/Resource';
import { MaybeReadingImage, ReadingImageType } from '../typings/models/ReadingImage';
import IconButton from '../components/common/IconButton';
import { MaybeReadingLocation, ReadingLocationType  } from '../typings/models/ReadingLocation';
import { MaybeLocation, LocationType } from '../typings/Location';
import { PendingReading } from '../typings/models/PendingReading';
import { ConfigTimeseries } from '../typings/models/ConfigTimeseries';
import { Maybe } from '../typings/MaybeTypes';

const SCREEN_WIDTH = Dimensions.get('window').width;

export interface OwnProps {
  groundwaterStationId: string | null,
  resourceId: string,
  resourceType: string,
  navigator: any,
  config: ConfigFactory,
}

export interface StateProps {
  userId: string,
  pendingSavedReadingsMeta: SyncMeta,
  translation: TranslationFile,
  location: MaybeLocation,
  resource: Maybe<AnyResource>,
  resourceMeta: ActionMeta
}

export interface ActionProps {
  saveReading: (api: BaseApi, externalApi: MaybeExternalServiceApi, userId: string, resourceId: string, reading: PendingReading) => any,
  getGeolocation: () => void,
}

export interface State {
  measurementString: string,
  timeseries: ConfigTimeseries,
  enableSubmitButton: boolean,
  date: moment.Moment,
  shouldShowCamera: boolean,
  readingImage: MaybeReadingImage,
}

class NewReadingScreen extends Component<OwnProps & StateProps & ActionProps> {
  state: State;
  appApi: BaseApi;
  externalApi: MaybeExternalServiceApi;
  camera: any;

  constructor(props: OwnProps & StateProps & ActionProps) {
    super(props);

    //@ts-ignore
    this.appApi = props.config.getAppApi();
    this.externalApi = props.config.getExternalServiceApi();

    // let resourceType = 'well';
    // if (props.resource.pending || props.resource.type === OrgType.MYWELL) {
    //   resourceType = props.resource.resourceType
    // }
    const timeseriesList: Array<ConfigTimeseries> = this.props.config.getDefaultTimeseries(props.resourceType);
    this.state = {
      enableSubmitButton: false,
      date: moment(),
      measurementString: '',
      shouldShowCamera: false,
      readingImage: { type: ReadingImageType.NONE },
      timeseries: timeseriesList[0],
    };

    //Binds
    this.showTakePictureScreen = this.showTakePictureScreen.bind(this);
    this.onTakePicture = this.onTakePicture.bind(this);
    this.onTakePictureError = this.onTakePictureError.bind(this);
    this.clearReadingImage = this.clearReadingImage.bind(this);
    this.saveReading = this.saveReading.bind(this);
  }

  componentWillMount() {
    this.props.getGeolocation();
  }

  showTakePictureScreen() {
    showModal(this.props, 'modal.TakePictureScreen', 'Take Picture', {
      onTakePicture: this.onTakePicture,
      onTakePictureError: this.onTakePictureError,
    });
  }

  onTakePicture(dataUri: string) {
    this.props.navigator.dismissModal();
    this.setState({
      readingImage: {
        type: ReadingImageType.IMAGE,
        url: dataUri
      }
    });
  }

  onTakePictureError(message: string) {
    maybeLog('Error taking picture', message);
    this.props.navigator.dismissModal();
  }

  clearReadingImage() {
    this.setState({
      readingImage: {
        type: ReadingImageType.NONE,
      }
    })
  }

  async saveReading() {

    Keyboard.dismiss();
    const { date, measurementString, timeseries, readingImage} = this.state;
    const { 
      pendingSavedReadingsMeta: {loading},

      location, 
    } = this.props;

    const {
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
    } = this.props.translation.templates


    /*
      GGMN Requires us to keep track of the groundwaterStationId as well as
      the resourceId
    */
    let groundwaterStationId = '';
    if (this.props.groundwaterStationId) {
      groundwaterStationId = this.props.groundwaterStationId;
    }
    
    if (loading) {
      //Don't allow a double button press!
      return;
    }

    //Map from a state location to reading location.
    //This is mainly because Firebase has a specific type of location it likes
    let readingLocation: MaybeReadingLocation = { type: ReadingLocationType.NONE};
    if (location.type === LocationType.LOCATION) {
      readingLocation = {
        type: ReadingLocationType.LOCATION,
        location: {
          _latitude: location.coords.latitude,
          _longitude: location.coords.longitude,
        }
      }
    }

    const readingRaw: any = {
      type: this.props.config.orgType,
      pending: true,
      resourceId: this.props.resourceId,
      timeseriesId: timeseries.parameter, //TODO actually get a timeseries ID somehow
      date: moment(date).utc().format(), //converts to iso string
      value: measurementString, //joi will take care of conversions for us
      userId: this.props.userId,
      image: readingImage,
      location: readingLocation,
      groundwaterStationId,

      //TD: hacks while we wait for a fix on types
      datetime: moment(date).utc().format(), //converts to iso string
      resourceType: this.props.resourceType,
    };

    const validateResult = validateReading(this.props.config.orgType, readingRaw);
    if (validateResult.type === ResultType.ERROR) {
      maybeLog(validateResult.message);

      displayAlert(
        new_reading_invalid_error_heading,
        new_reading_invalid_error_description,
        [{ text: new_reading_invalid_error_ok, onPress: () => { } }]
      );

      return;
    }

    console.log("Validate result is", validateResult);

    const saveResult: SomeResult<SaveReadingResult> = await this.props.saveReading(this.appApi, this.externalApi, this.props.userId, this.props.resourceId, validateResult.result);

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
    const { timeseries } = this.state;
    if (!timeseries || timeseries.parameter.length === 0) {
      return false;
    }

    return true;
  }

  getImageSection() {
    const { readingImage } = this.state;

    if (!this.props.config.getNewReadingShouldShowImageUpload()) {
      return null;
    }

    return (
      <View style={{
        height: 300,
        backgroundColor: primaryDark,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        { readingImage.type === ReadingImageType.NONE ? 
          <Button
            title="Add an Image"
            raised={true}
            icon={{ name: 'camera' }}
            buttonStyle={{
              backgroundColor: primary,
            }}
            onPress={this.showTakePictureScreen}
            underlayColor="transparent"
          /> : null
        }
        { readingImage.type === ReadingImageType.IMAGE ? 
          <View 
            style={{
              backgroundColor: primaryDark,
              flex: 1,
              width: '100%',
              height: 300,
            }}
          >
            <View 
              style={{
                position: 'absolute',
                zIndex: 10,
                right: 10,
                top: 10,
              }}
            >
              <IconButton
                name={'close'}
                onPress={this.clearReadingImage}
              />
            </View>
            <Image
              style={{
                width: '100%',
                height: 300,
              }}
              source={{ uri: `data:image/png;base64,${readingImage.url}`}}
            /> 
          </View> : null
        }
      </View>
    );
  }

  getForm() {
    //TODO: get units from reading.metadata
    // const units = 'metres';
    const { date, measurementString, timeseries  } = this.state;
    const { resource, resourceType } = this.props;
    const {
      new_reading_date_field,
      new_reading_date_field_invalid,
      new_reading_value_field,
      new_reading_value_field_invalid,
      new_reading_timeseries,
    } = this.props.translation.templates;

    console.log("Resource type is", resourceType);
    const timeseriesList: ConfigTimeseries[] = this.props.config.getDefaultTimeseries(resourceType);
    console.log("timeseriesList is", timeseriesList);

    return (
      <View style={{
        flex: 1,
        width: '100%',
        paddingHorizontal: 20,
        marginTop: 10,
        flexDirection: 'column',
        paddingBottom: 10,
      }}>
        <IconFormInput
          iconName='calendar'
          iconColor={primaryDark}
          placeholder={new_reading_date_field}
          errorMessage={this.isDateValid() ? null : new_reading_date_field_invalid}
          onChangeText={(dateStr: Date) => {
            const date: moment.Moment = moment(dateStr);
            this.setState({date});
          }}
          fieldType={InputType.dateTimeInput}
          value={date}
        />
        <IconFormInput
          iconName='pencil'
          iconColor={primaryDark}
          placeholder={new_reading_value_field(timeseries.unitOfMeasure)}
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
            selectedValue={this.state.timeseries.parameter}
            style={{
              flex: 2
            }}
            mode={'dropdown'}
            onValueChange={(_, idx) => {
              const ts = timeseriesList[idx];
              this.setState({ timeseries: ts });
            }}
          >
            {timeseriesList.map(ts => <Picker.Item key={ts.parameter} label={ts.name} value={ts.parameter} />)}
          </Picker>
        </View>
        {this.getImageSection()}
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
        raised={true}
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
        onPress={this.saveReading}
        underlayColor="transparent"
      />
    );
  }

  render() {
    return (
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

const mapStateToProps = (state: AppState, ownProps: OwnProps): StateProps => {

  const resource = state.resourcesCache[ownProps.resourceId];
  let resourceMeta = state.resourceMeta[ownProps.resourceId];
  //TODO: clean this up
  if (!resourceMeta) {
    resourceMeta = { loading: false, error: false, errorMessage: '' };
  }


  return {
    pendingSavedReadingsMeta: state.pendingSavedReadingsMeta,
    translation: state.translation,
    location: state.location,
    userId: unwrapUserId(state.user),
    resource,
    resourceMeta,
  }
}

const mapDispatchToProps = (dispatch: any): ActionProps => {
  return {
    saveReading: (api: BaseApi, externalApi: MaybeExternalServiceApi, userId: string, resourceId: string, reading: PendingReading) => 
      { return dispatch(appActions.saveReading(api, externalApi, userId, resourceId, reading))},
    getGeolocation: () => dispatch(appActions.getGeolocation())
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(NewReadingScreen);