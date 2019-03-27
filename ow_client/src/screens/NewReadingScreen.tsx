import * as React from 'react'; import { Component } from 'react';
import {
  ScrollView,
  View,
  Dimensions,
  TouchableWithoutFeedback,
  Picker,
  Keyboard,
  Image,
  ToastAndroid,
} from 'react-native';
import { 
  Button, Text 
} from 'react-native-elements';
import * as moment from 'moment';

import IconFormInput,{ InputType } from '../components/common/IconFormInput';
import { displayAlert, maybeLog, showModal, unwrapUserId, renderLog } from '../utils';
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
import FloatingButtonWrapper from '../components/common/FloatingButtonWrapper';
import SaveButton from '../components/common/SaveButton';
import { diff } from 'deep-object-diff';
import { surfaceText } from '../utils/NewColors';
import { default as UserAdminType } from 'ow_common/lib/enums/UserType';
import { safeGetNested } from 'ow_common/lib/utils';


const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

export interface OwnProps {
  navigator: any,

  groundwaterStationId: string | null,
  resourceId: string,
  resourceType: string,
  config: ConfigFactory,
}

export interface StateProps {
  userId: string,
  pendingSavedReadingsMeta: SyncMeta,
  translation: TranslationFile,
  location: MaybeLocation,
  resource: Maybe<AnyResource>,
  resourceMeta: ActionMeta
  isResourcePending: boolean,
  userType: UserAdminType,
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
  formHeight: number,
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

    const timeseriesList: Array<ConfigTimeseries> = this.props.config.getDefaultTimeseries(props.resourceType);
    this.state = {
      enableSubmitButton: false,
      date: moment(),
      measurementString: '',
      shouldShowCamera: false,
      readingImage: { type: ReadingImageType.NONE },
      timeseries: timeseriesList[0],
      formHeight: SCREEN_HEIGHT,
    };

    //Binds
    this.showTakePictureScreen = this.showTakePictureScreen.bind(this);
    this.onTakePicture = this.onTakePicture.bind(this);
    this.onTakePictureError = this.onTakePictureError.bind(this);
    this.clearReadingImage = this.clearReadingImage.bind(this);
    this.saveReading = this.saveReading.bind(this);

    /* Listeners */
    Keyboard.addListener('keyboardDidShow', this.keyboardDidShow.bind(this));
    Keyboard.addListener('keyboardDidHide', this.keyboardDidHide.bind(this));
  }

  componentWillMount() {
    this.props.getGeolocation();
  }

  componentWillUnmount() {
    Keyboard.removeListener('keyboardDidShow', this.keyboardDidShow);
    Keyboard.removeListener('keyboardDidHide', this.keyboardDidHide);
  }

  componentWillUpdate(nextProps: OwnProps & StateProps & ActionProps, nextState: State, nextContext: any) {
    renderLog("NewReadingScreen componentWillUpdate():");
    renderLog("     - ", diff(this.props, nextProps));
    renderLog("     - ", diff(this.state, nextState));
  }

  shouldComponentUpdate(nextProps: OwnProps & StateProps & ActionProps, nextState: State, nextContext: any) {
    if (Object.keys(diff(this.state, nextState)).length > 0) {
      return true;
    }

    return false;
  }

  /**
   * Listeners
   * //TD: these listeners aren't always removed properly
   */
  keyboardDidShow(event: any): void {
    const formHeight = SCREEN_HEIGHT - event.endCoordinates.height;
    this.setState({ formHeight });
  }

  keyboardDidHide(event: any): void {
    this.setState({
      formHeight: SCREEN_HEIGHT,
    });
  }

  showTakePictureScreen() {
    showModal(this.props, 'modal.TakePictureScreen', 'Take Picture', {
      onTakePicture: this.onTakePicture,
      onTakePictureError: this.onTakePictureError,
    });
  }

  onTakePicture(dataUri: string, fileUrl: string) {
    this.props.navigator.dismissModal();
    this.setState({
      readingImage: {
        type: ReadingImageType.IMAGE,
        url: dataUri,
        fileUrl,
      }
    });
  }

  onTakePictureError(message: string) {
    //TODO: translate
    const take_picture_error_message = 'There was a problem taking the picture. Make sure you have enabled photo permissions and try again';
    ToastAndroid.show(take_picture_error_message, ToastAndroid.LONG);
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
      pendingSavedReadingsMeta: { loading },
      isResourcePending,
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
      isResourcePending,
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

    //TODO: Translate
    const add_image_text = "Add an Image";
    return (
      <View style={{
        height: 300,
        backgroundColor: primaryDark,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        { readingImage.type === ReadingImageType.NONE ? 
          <Button
            title={add_image_text}
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
              source={{ uri: readingImage.fileUrl }}
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
      // long_date_format
    } = this.props.translation.templates;

    const timeseriesList: ConfigTimeseries[] = this.props.config.getDefaultTimeseries(resourceType);

    return (
      <ScrollView 
        keyboardShouldPersistTaps='handled'
        style={{
          flex: 1,
          width: '100%',
          paddingHorizontal: 10,
          flexDirection: 'column',
          paddingBottom: 10,
        }}
      >
        <IconFormInput
          iconName='calendar'
          iconColor={primaryDark}
          placeholder={new_reading_date_field}
          errorMessage={this.isDateValid() ? null : new_reading_date_field_invalid}
          onChangeText={(date: moment.Moment) => {
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
        {
          //Only show the timeseries selector if there is more than one to pick from
          timeseriesList.length > 1 &&
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
          }
        {this.getImageSection()}
        {/* Transparent footer to make the scrollview balance */}
        <View
          style={{
            height: 75,
          }}
        />
      </ScrollView>
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
      <FloatingButtonWrapper>
        <SaveButton
          loading={loading}
          disabled={this.shouldDisableSubmitButton()}
          title={loading ? "loading" : new_reading_save_button}
          icon={{ name: 'save', color: secondaryText }}
          height={50}
          onPress={this.saveReading}
        />
      </FloatingButtonWrapper>
    );
  }

  getPermissionOverlay() {
    const save_reading_permission_heading = 'Can\'t Save Readings';
    const save_reading_permission_text = "You don't have permission to save readings to this resource, because you don't own it.";

    return (
      <View style={{
        flex: 1,
        alignSelf: 'center',
        justifyContent: 'center',
        paddingHorizontal: 35,
        height: '100%',
      }}>
        <Text style={{ color: surfaceText.high, textAlign: "left", fontWeight: '800', fontSize: 22, paddingBottom: 10 }}>{save_reading_permission_heading}</Text>
        <Text style={{ color: surfaceText.med, textAlign: "left", fontWeight: '400', fontSize: 15, paddingBottom: 10, }}>{save_reading_permission_text}</Text>
      </View>
    );
  }

  render() {
    renderLog(`NewReadingScreen render()`);

    let hasWritePermission = false;
    if (this.props.userType === UserAdminType.Admin) {
      hasWritePermission = true;
    }

    const ownerId = safeGetNested(this.props, ['resource', 'owner', 'createdByUserId']);
    //Publicly editable
    if (!ownerId || ownerId === 'default') {
      hasWritePermission = true;
    } else if (ownerId === this.props.userId) {
      hasWritePermission = true;
    }

    return (
      // <TouchableWithoutFeedback 
      //   style={{
      //     flex: 1,
      //     flexDirection: 'column',  
      //     width: '100%',
      //   }}
      //   onPress={() => {
      //     return false;
      //   }}
      // >
        <View style={{flex: 1}} >
          {hasWritePermission && this.getForm()}
          {hasWritePermission &&  this.getButton()}
          {hasWritePermission || this.getPermissionOverlay()}
        </View>
      // </TouchableWithoutFeedback>
    );
  }
}

const mapStateToProps = (state: AppState, ownProps: OwnProps): StateProps => {

  const resource = state.resourcesCache.find(r => r.id === ownProps.resourceId);
  let resourceMeta = state.resourceMeta[ownProps.resourceId];
  //TODO: clean this up
  if (!resourceMeta) {
    resourceMeta = { loading: false, error: false, errorMessage: '' };
  }

  //Look for the resource in pending resources. If it's there, then this reading must be for a pending resource
  let isResourcePending = false;
  if (state.pendingSavedResources.findIndex((r) => r.id === ownProps.resourceId) >= -1) {
    isResourcePending = true;
  }

  return {
    pendingSavedReadingsMeta: state.pendingSavedReadingsMeta,
    translation: state.translation,
    location: state.location,
    userId: unwrapUserId(state.user),
    resource,
    resourceMeta,
    isResourcePending,
    userType: state.userType,
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