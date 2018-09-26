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
import { SyncMeta } from '../../AppProvider';
import { TextInput } from '../../components/common/FormComponents';
import { validateResource } from '../../api/ValidationApi';


export interface Props { 
  resourceId: string,
  navigator: any,
  config: ConfigFactory,
  userId: string,
  appApi: BaseApi,

  //Injected by Consumer
  pendingSavedResourcesMeta: SyncMeta, 
  // saveResource: (api: BaseApi, userId: string, resource: Resource | PendingResource) => any,
  saveResource: any,
}

export interface State {

}

class EditResourceScreen extends Component<Props> {
  state: State;
  appApi: BaseApi;
  editResourceForm: any;

  constructor(props: Props) {
    super(props);

    //@ts-ignore
    this.appApi = this.props.config.getAppApi();
    this.state = {
      isLoading: false,
    };

    this.editResourceForm = FormBuilder.group({
      lat: ['', Validators.required],//, Validators.min(-90), Validators.max(90)],
      lng: ['', Validators.required],// Validators.min(-180), Validators.max(180)],
      organisationId: ['', Validators.required],      
      asset: ['', Validators.required],
      ownerName: ['', Validators.required],

      //TODO: add other necessary fields
    });
  }

  handleSubmit = async () => {
    Keyboard.dismiss();

    //TODO: parse resource from this.editResourceForm
    console.log("form values:", this.editResourceForm.value);
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
    console.log("unvalidated resource:", unvalidatedResource);
    
    const validationResult: SomeResult<Resource | PendingResource> = validateResource(unvalidatedResource);
    if (validationResult.type === ResultType.ERROR) {
      ToastAndroid.show(`Error saving Resource: ${validationResult.message}`, ToastAndroid.SHORT);
      return;
    }

    const result: SomeResult<SaveResourceResult> = await this.props.saveResource(this.appApi, this.props.userId, validationResult.result);

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

    console.log("getForm form:", this.editResourceForm);

    return (
      <FieldGroup
        strict={false}
        control={this.editResourceForm}
        render={({get, invalid}) => (
          <View>
            {/* TODO: make look pretty! */}
            <FieldControl
              name="lat"
              render={TextInput}
              meta={{ label: "Latitude", secureTextEntry: false, keyboardType: 'numeric' }}
            />
            <FieldControl
              name="lng"
              render={TextInput}
              meta={{ label: "Longitude", secureTextEntry: false, keyboardType: 'numeric' }}
            />
            {/* TODO: dropdown */}
            <FieldControl
              name="organisationId"
              render={TextInput}
              meta={{ label: "Organisation", secureTextEntry: false, keyboardType: 'default' }}
            />

            {/* TODO: dropdown */}
            <FieldControl
              name="asset"
              render={TextInput}
              meta={{ label: "Asset Type", secureTextEntry: false, keyboardType: 'default' }}
            />
            <FieldControl
              name="ownerName"
              render={TextInput}
              meta={{ label: "Owner Name", secureTextEntry: false, keyboardType: 'default' }}
            />
            <Button
              style={{
                paddingBottom: 20,
                minHeight: 50,
              }}
              loading={loading}
              disabled={invalid}
              title={loading ? '' : 'Submit'}
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
  }
}

const mapDispatchToProps = (dispatch: any) => {
  return {
    saveResource: (api: BaseApi, userId: string, resource: Resource) =>
     { return dispatch(appActions.saveResource(api, userId, resource)) }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(EditResourceScreen);