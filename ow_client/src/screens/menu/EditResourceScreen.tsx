import * as React from 'react';
import { Component } from 'react';
import {
  View, Keyboard, ToastAndroid, ScrollView,
} from 'react-native';
import {
  Button
} from 'react-native-elements';
import IconFormInput, { InputType } from '../../components/common/IconFormInput';
import { ResourceTypeArray, ResourceType } from '../../enums';
import { ConfigFactory } from '../../config/ConfigFactory';
import BaseApi from '../../api/BaseApi';
import { Resource, PendingResource, SaveResourceResult } from '../../typings/models/OurWater';
import * as appActions from '../../actions';
import { AppState } from '../../reducers';
import { connect } from 'react-redux'
import { FormBuilder, Validators, FieldGroup, FieldControl } from 'react-reactive-form';
import { SomeResult, ResultType } from '../../typings/AppProviderTypes';
import { TextInput } from '../../components/common/FormComponents';
import { validateResource } from '../../api/ValidationApi';
import ExternalServiceApi, { MaybeExternalServiceApi } from '../../api/ExternalServiceApi';
import { SyncMeta } from '../../typings/Reducer';
import { AnyLoginDetails, LoginDetailsType } from '../../typings/api/ExternalServiceApi';
import IconButton from '../../components/common/IconButton';
import LoadLocationButton from '../../components/LoadLocationButton';
import { NoLocation, Location, LocationType } from '../../typings/Location';
import * as equal from 'fast-deep-equal';
import { secondary, secondaryText } from '../../utils/Colors';

export interface Props { 
  resourceId: string,
  navigator: any,
  config: ConfigFactory,
  userId: string,
  appApi: BaseApi,

  //Injected by Consumer
  pendingSavedResourcesMeta: SyncMeta, 
  saveResource: (api: BaseApi, externalApi: MaybeExternalServiceApi, userId: string, resource: Resource) => any,
  externalLoginDetails: AnyLoginDetails,
  externalLoginDetailsMeta: SyncMeta,
  location: Location | NoLocation,
}

export interface State {

}

class EditResourceScreen extends Component<Props> {
  state: State;
  appApi: BaseApi;
  externalApi: MaybeExternalServiceApi;
  editResourceForm: any;

  constructor(props: Props) {
    super(props);

    //@ts-ignore
    this.appApi = this.props.config.getAppApi();
    this.externalApi = this.props.config.getExternalServiceApi();
    
    this.state = {
      isLoading: false,
    };

    let lat = '';
    let lng = '';
    if (props.location.type === LocationType.LOCATION) {
      lat = `${props.location.coords.latitude.toFixed(4)}`;
      lng = `${props.location.coords.longitude.toFixed(4)}`;
    }

    this.editResourceForm = FormBuilder.group({
      lat: [lat, Validators.required],
      lng: [lng, Validators.required],
      asset: ['Groundwater Station', Validators.required],
      ownerName: ['', Validators.required],
    });
  }

  componentWillReceiveProps(newProps: Props) {
    const { location } = this.props;

    if (!equal(location, newProps.location)) {
      if (newProps.location.type === LocationType.LOCATION) {
        this.editResourceForm.get('lat').setValue(`${newProps.location.coords.latitude.toFixed(4)}`);
        this.editResourceForm.get('lng').setValue(`${newProps.location.coords.longitude.toFixed(4)}`);
      }
    }
  }

  handleSubmit = async () => {
    Keyboard.dismiss();

    const unvalidatedResource = {
      coords: {
        latitude: this.editResourceForm.value.lat,
        longitude: this.editResourceForm.value.lng,
      },
      resourceType: 'well',
      owner: {
        name: this.editResourceForm.value.ownerName,
      },
      userId: this.props.userId,
    };
    
    const validationResult: SomeResult<Resource | PendingResource> = validateResource(unvalidatedResource);
    if (validationResult.type === ResultType.ERROR) {
      ToastAndroid.show(`Error saving Resource: ${validationResult.message}`, ToastAndroid.SHORT);
      return;
    }

    const result: SomeResult<SaveResourceResult> = await this.props.saveResource(this.appApi, this.externalApi, this.props.userId, validationResult.result);

    if (result.type === ResultType.ERROR) {
      ToastAndroid.show(`Error saving Resource: ${result.message}`, ToastAndroid.SHORT);
      return;
    }

    let message = `Successfully Saved Resource!`;
    if (result.result.requiresLogin) {
      message = `Saved resouce. Login to GGMN to sync.`
    }

    ToastAndroid.show(message, ToastAndroid.SHORT);
    this.props.navigator.pop();
  }

  getForm() {
    const { pendingSavedResourcesMeta: { loading }} = this.props;

    return (
      <FieldGroup
        strict={false}
        control={this.editResourceForm}
        render={({get, invalid}) => (
          <View>
            {/* TODO: make look pretty! */}
            <View style={{
              flexDirection: 'row',
            }}>
              <LoadLocationButton style={{
                alignSelf: 'center',
                // paddingLeft: 15,
              }}/>
              <FieldControl
                name="lat"
                render={TextInput}
                meta={{ editable: true, label: "Latitude", secureTextEntry: false, keyboardType: 'numeric' }}
                />
              <FieldControl
                name="lng"
                render={TextInput}
                meta={{ editable: true, label: "Longitude", secureTextEntry: false, keyboardType: 'numeric' }}
                />
            </View>

            {/* TODO: dropdown? */}
            <FieldControl
              name="asset"
              render={TextInput}
              meta={{ editable: false, label: "Asset Type", secureTextEntry: false, keyboardType: 'default' }}
            />
            <FieldControl
              name="ownerName"
              render={TextInput}
              meta={{ editable: true, label: "Owner Name", secureTextEntry: false, keyboardType: 'default' }}
            />
            <Button
              style={{
                paddingBottom: 20,
                minHeight: 50,
              }}
              buttonStyle={{
                backgroundColor: secondary,
              }}
              containerViewStyle={{
                marginVertical: 20,
              }}
              textStyle={{
                color: secondaryText,
                fontWeight: '700',
              }}
              loading={loading}
              disabled={invalid}
              title={loading ? '' : 'SUBMIT'}
              onPress={() => this.handleSubmit()}
            />
          </View>
        )}
      />
    );
  }

  render() {
    return (
      <ScrollView
        style={{
          flexDirection: 'column',
        }}
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps={'always'}
      >
        {this.getForm()}
      </ScrollView>
    );
  }
}

const mapStateToProps = (state: AppState) => {
  return {
    pendingSavedResourcesMeta: state.pendingSavedResourcesMeta,
    externalLoginDetails: state.externalLoginDetails,
    externalLoginDetailsMeta: state.externalLoginDetailsMeta,
    location:state.location,
  }
}

const mapDispatchToProps = (dispatch: any) => {
  return {
    saveResource: (api: BaseApi, externalApi: MaybeExternalServiceApi, userId: string, resource: Resource) =>
     { return dispatch(appActions.saveResource(api, externalApi, userId, resource)) }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(EditResourceScreen);