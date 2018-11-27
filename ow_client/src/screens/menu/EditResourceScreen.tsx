import * as React from 'react';
import { Component } from 'react';
import {
  View, Keyboard, ToastAndroid, ScrollView,
} from 'react-native';
import {
  Button
} from 'react-native-elements';
import { ResourceType } from '../../enums';
import { ConfigFactory } from '../../config/ConfigFactory';
import BaseApi from '../../api/BaseApi';
import { SaveResourceResult } from '../../typings/models/OurWater';
import * as appActions from '../../actions';
import { AppState } from '../../reducers';
import { connect } from 'react-redux'
import { FormBuilder, Validators, FieldGroup, FieldControl, AbstractControl } from 'react-reactive-form';
import { SomeResult, ResultType } from '../../typings/AppProviderTypes';
import { TextInput, DropdownInput, TextIdInput } from '../../components/common/FormComponents';
import { validateResource } from '../../api/ValidationApi';
import { MaybeExternalServiceApi } from '../../api/ExternalServiceApi';
import { SyncMeta } from '../../typings/Reducer';
import { AnyLoginDetails, LoginDetailsType } from '../../typings/api/ExternalServiceApi';
import LoadLocationButton from '../../components/LoadLocationButton';
import { NoLocation, Location, LocationType } from '../../typings/Location';
import * as equal from 'fast-deep-equal';
import { secondary, secondaryText, error1 } from '../../utils/Colors';
import { PendingResource } from '../../typings/models/PendingResource';
import { OrgType } from '../../typings/models/OrgType';
import { MaybeExtendedResourceApi, ExtendedResourceApiType } from '../../api/ExtendedResourceApi';
import { TranslationFile } from 'ow_translations/src/Types';
import { AnyResource } from '../../typings/models/Resource';
import Config from 'react-native-config';
import { unwrapUserId } from '../../utils';

export interface Props { 
  resourceId: string,
  navigator: any,
  config: ConfigFactory,
  appApi: BaseApi,
  resource?: AnyResource | PendingResource,
  
  //Injected by Consumer
  userId: string,
  pendingSavedResourcesMeta: SyncMeta, 
  externalLoginDetails: AnyLoginDetails,
  externalLoginDetailsMeta: SyncMeta,
  location: Location | NoLocation,
  translation: TranslationFile,
  name: string | null,
  saveResource: (api: BaseApi, externalApi: MaybeExternalServiceApi, userId: string, resource: AnyResource | PendingResource) => any,
  deletePendingResource: (api: BaseApi, userId: string, pendingResourceId: string) => any,
}

export interface State {

}

export type EditResourceFormBuilder = {
  id: any,
  lat: any,
  lng: any,
  asset: any,
  ownerName?: any,
}


class EditResourceScreen extends Component<Props> {
  state: State;
  appApi: BaseApi;
  externalApi: MaybeExternalServiceApi;
  extendedResourceApi: MaybeExtendedResourceApi
  editResourceForm: any;

  constructor(props: Props) {
    super(props);

    //@ts-ignore
    this.appApi = this.props.config.getAppApi();
    this.externalApi = this.props.config.getExternalServiceApi();
    this.extendedResourceApi = this.props.config.getExtendedResourceApi();
    
    this.state = {};

    /* Binds */
    this.asyncIdValidator = this.asyncIdValidator.bind(this);
    this.handleDelete = this.handleDelete.bind(this);

    this.editResourceForm = FormBuilder.group(this.getFormBuilder(this.props));
  }

  /**
   * Set up the forms
   */
  getFormBuilder(props: Props): EditResourceFormBuilder {

    if (props.resource) {
      const builder = this.getEditFormBuilder(props, props.resource);
      return builder
    }

    return this.getNewFormBuilder(props);
  }

  getEditFormBuilder(props: Props, resource: AnyResource | PendingResource): EditResourceFormBuilder {
    let id;
    let lat;
    let lng;
    let asset;
    let ownerName;

    id = [ resource.id, Validators.required];

    if (resource.pending) {
      lat = [`${resource.coords.latitude}`, Validators.required];
      lng = [`${resource.coords.longitude}`, Validators.required];
      asset = [resource.resourceType, Validators.required];
      ownerName = resource.owner && [resource.owner, Validators.required];


      return {
        id,
        lat,
        lng,
        asset,
        ownerName,
      }
    } 

    if (resource.type === OrgType.GGMN) {
      lat = [`${resource.coords._latitude}`, Validators.required];
      lng = [`${resource.coords._longitude}`, Validators.required];
      asset = [resource.type, Validators.required];
    }

    if (resource.type === OrgType.MYWELL) {
      lat = [`${resource.coords._latitude}`, Validators.required];
      lng = [`${resource.coords._longitude}`, Validators.required];
      asset = [resource.type, Validators.required];
      ownerName = [resource.owner.name, Validators.required];
    }

    return {
      id,
      lat,
      lng,
      asset,
      ownerName,
    }
  }

  getNewFormBuilder(props: Props): EditResourceFormBuilder {
    /* Set up the form */
    let lat = '';
    let lng = '';
    if (props.location.type === LocationType.LOCATION) {
      lat = `${props.location.coords.latitude.toFixed(4)}`;
      lng = `${props.location.coords.longitude.toFixed(4)}`;
    }

    const defaultResourceType = props.config.getAvailableResourceTypes()[0];

    const formBuilderGroup: any = {
      lat: [lat, Validators.required],
      lng: [lng, Validators.required],
      asset: [defaultResourceType, Validators.required],
    };

    let ownerName = '';
    if (this.props.name) {
      ownerName = this.props.name;
    }
    if (this.props.config.getEditResourceShouldShowOwnerName()) {
      formBuilderGroup['ownerName'] = [ownerName, Validators.required];
    }

    if (this.props.config.getEditResourceAllowCustomId()) {
      formBuilderGroup['id'] = ['', Validators.required, this.asyncIdValidator];
    }

    return formBuilderGroup;
  }


  async asyncIdValidator(control: AbstractControl) {
    const { new_resource_id_check_error } = this.props.translation.templates;

    if (control.value.length < 4) {
      //ew: don't like throwing as flow control
      throw { invalidId: true };
    }

    if (this.extendedResourceApi.extendedResourceApiType === ExtendedResourceApiType.None) {
      //Tried to check, but this call is invalid.
      return Promise.resolve(null);
    }

    const result = await this.extendedResourceApi.checkNewId(control.value);
    //TODO: fix this, as checkNewId now returns AnyResource or is an error

    if (result.type === ResultType.ERROR) {
      ToastAndroid.show(new_resource_id_check_error, ToastAndroid.SHORT);

      throw { invalidId: true };
    }

    if (result.result === false) {
      throw { invalidId: true };
    }

    return null;
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
    const { translation: { templates: {new_resource_saved_dialog, new_resource_saved_dialog_warning}}} = this.props;

    Keyboard.dismiss();

    const name = this.props.config.getEditResourceShouldShowOwnerName() ? this.editResourceForm.value.ownerName : 'none';

    //TODO: make more type safe
    const unvalidatedResource: any = {

      //TODO: load the id?
      pending: true,
      coords: {
        latitude: this.editResourceForm.value.lat,
        longitude: this.editResourceForm.value.lng,
      },
      resourceType: this.editResourceForm.value.asset,
      owner: {
        name,
      },
      userId: this.props.userId,
      //TODO: load from default configs for each org + resource type
      timeseries: this.props.config.getDefaultTimeseries(this.editResourceForm.value.asset),
    };

    if (this.props.config.getEditResourceAllowCustomId()) {
      unvalidatedResource.id = this.editResourceForm.value.id;
    }
    
    const validationResult: SomeResult<PendingResource> = validateResource(unvalidatedResource);
    if (validationResult.type === ResultType.ERROR) {
      ToastAndroid.show(`Error saving Resource: ${validationResult.message}`, ToastAndroid.SHORT);
      return;
    }

    const result: SomeResult<SaveResourceResult> = await this.props.saveResource(this.appApi, this.externalApi, this.props.userId, validationResult.result);

    if (result.type === ResultType.ERROR) {
      ToastAndroid.show(`Error saving Resource: ${result.message}`, ToastAndroid.SHORT);
      return;
    }

    let message = new_resource_saved_dialog ;
    if (result.result.requiresLogin) {
      message = new_resource_saved_dialog_warning
    }

    ToastAndroid.show(message, ToastAndroid.SHORT);
    // this.props.navigator.pop();
    this.props.navigator.dismissModal();
  }

  handleDelete() {
    if (this.props.resource) {
      this.props.deletePendingResource(this.appApi, this.props.userId, this.props.resource.id);
    }
    this.props.navigator.dismissModal();
  }

  getForm() {
    const {
      pendingSavedResourcesMeta: { loading },
    } = this.props;

    const { 
      new_resource_id,
      new_resource_id_check_taken,
      resource_name,
      new_resource_lat, 
      new_resource_lng, 
      new_resource_owner_name_label, 
      new_resource_submit_button, 
      new_resource_asset_type_label,
    } = this.props.translation.templates;

    const localizedResourceTypes = this.props.config.getAvailableResourceTypes().map((t: ResourceType) => {
      return {
        key: t,
        //TODO: translate based on language settings
        label: t,
      }
    });

    return (
      <FieldGroup
        strict={false}
        control={this.editResourceForm}
        render={({get, invalid}) => (
          <View>
            {this.props.config.getEditResourceAllowCustomId() ?
              <FieldControl
                name="id"
                render={TextIdInput}
                meta={{ 
                  editable: true, 
                  label: new_resource_id, 
                  secureTextEntry: false, 
                  keyboardType: 'default',
                  asyncErrorMessage: new_resource_id_check_taken,
                }}
              /> : null}
            <View style={{
              flexDirection: 'row',
            }}>
              <LoadLocationButton 
                style={{
                  alignSelf: 'center',
                }}/>
              <FieldControl
                name="lat"
                render={TextInput}
                meta={{ editable: true, label: new_resource_lat, secureTextEntry: false, keyboardType: 'numeric' }}
                />
              <FieldControl
                name="lng"
                render={TextInput}
                meta={{ editable: true, label: new_resource_lng, secureTextEntry: false, keyboardType: 'numeric' }}
                />
            </View>
            <FieldControl
              name="asset"
              // @ts-ignore
              render={DropdownInput}
              meta={{
                options: localizedResourceTypes,
                editable: false,
                label: new_resource_asset_type_label,
                secureTextEntry: false,
                keyboardType: 'default' 
              }}
            />
            { this.props.config.getEditResourceShouldShowOwnerName() ?
              <FieldControl
                name="ownerName"
                render={TextInput}
                meta={{ editable: true, label: new_resource_owner_name_label, secureTextEntry: false, keyboardType: 'default' }}
              /> : null }
            <Button
              style={{
                paddingBottom: 20,
                minHeight: 50,
              }}
              buttonStyle={{
                backgroundColor: secondary,
                minHeight: 50,
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
              title={loading ? '' : new_resource_submit_button}
              onPress={() => this.handleSubmit()}
            />
          </View>
        )}
      />
    );
  }

  getDeleteButton() {
    // const {
    //   edit_resource_delete_button
    // } = this.props.translation.templates;

    //TODO: translate
    const edit_resource_delete_button = 'DELETE';

    return (
      <Button
        style={{
          paddingBottom: 20,
          minHeight: 50,
        }}
        buttonStyle={{
          backgroundColor: error1,
          minHeight: 50,
        }}
        containerViewStyle={{
          // marginVertical: 20,
        }}
        textStyle={{
          color: secondaryText,
          fontWeight: '700',
        }}
        title={edit_resource_delete_button}
        onPress={this.handleDelete}
      />
    )
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
        {this.props.resource && this.getDeleteButton()}
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
    translation: state.translation,
    name: state.name,
    userId: unwrapUserId(state.user),
  }
}

const mapDispatchToProps = (dispatch: any) => {
  return {
    saveResource: (api: BaseApi, externalApi: MaybeExternalServiceApi, userId: string, resource: AnyResource | PendingResource) =>
      dispatch(appActions.saveResource(api, externalApi, userId, resource)),
    deletePendingResource: (api: BaseApi, userId: string, pendingResourceId: string) =>
      dispatch(appActions.deletePendingResource(api, userId, pendingResourceId)),

  }
}

export default connect(mapStateToProps, mapDispatchToProps)(EditResourceScreen);