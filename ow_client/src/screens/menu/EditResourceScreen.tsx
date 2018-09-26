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
import { Resource, PendingResource } from '../../typings/models/OurWater';
import * as appActions from '../../actions';
import { AppState } from '../../reducers';
import { connect } from 'react-redux'
import { FormBuilder, Validators, FieldGroup, FieldControl } from 'react-reactive-form';
import { SomeResult, ResultType } from '../../typings/AppProviderTypes';
import { SyncMeta } from '../../AppProvider';
import { TextInput } from '../../components/common/FormComponents';


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
      lat: ['', Validators.required],
      lng: ['', Validators.required],
      organisationId: ['', Validators.required],      
      asset: ['', Validators.required],
      ownerName: ['', Validators.required],

      //TODO: add other necessary fields
    });
  }

  handleSubmit = async () => {
    Keyboard.dismiss();

    //TODO: parse resource from this.editResourceForm
    const resource: Resource | PendingResource = {

    }
    const result: SomeResult<void> = await this.props.saveResource(this.appApi, this.props.userId, resource);

    if (result.type === ResultType.ERROR) {
      ToastAndroid.show(`Error saving Resource: ${result.message}`, ToastAndroid.SHORT);
      return;
    }

    ToastAndroid.show(`Successfully Saved Resource!`, ToastAndroid.SHORT);
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
            <FieldControl
              name="lat"
              render={TextInput}
              meta={{ label: "Latitude", secureTextEntry: false }}
            />
            <FieldControl
              name="lng"
              render={TextInput}
              meta={{ label: "Longitude", secureTextEntry: false }}
            />
            {/* TODO: dropdown */}
            <FieldControl
              name="organisationId"
              render={TextInput}
              meta={{ label: "Organisation", secureTextEntry: false }}
            />

            {/* TODO: dropdown */}
            <FieldControl
              name="asset"
              render={TextInput}
              meta={{ label: "Asset Type", secureTextEntry: false }}
            />
            <FieldControl
              name="ownerName"
              render={TextInput}
              meta={{ label: "Owner Name", secureTextEntry: false }}
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


  //TODO: load the resource if we already have the id

  // dep_getForm() {
  //   const { lat, lng, ownerName} = this.state;

  //   return (
  //     <View style={{
  //       width: '100%',
  //       flexDirection: 'column'
  //     }}>
  //       <IconFormInput
  //         iconName='pencil'
  //         iconColor='#FF6767'
  //         placeholder='latitude'
  //         errorMessage={
  //           lat.length > 0 && !this.isFieldValid(lat) ?
  //             'Field is required' : null
  //         }
  //         onChangeText={(lat: string) => this.setState({ lat })}
  //         onSubmitEditing={() => console.log('on submit editing')}
  //         fieldType={InputType.fieldInput}
  //         value={lat}
  //         keyboardType='default'
  //       />
  //       <IconFormInput
  //         iconName='pencil'
  //         iconColor='#FF6767'
  //         placeholder='longitude'
  //         errorMessage={
  //           lng.length > 0 && !this.isFieldValid(lng) ?
  //             'Field is required' : null
  //         }
  //         onChangeText={(lng: string) => this.setState({ lng })}
  //         onSubmitEditing={() => console.log('on submit editing')}
  //         fieldType={InputType.fieldInput}
  //         value={lng}
  //         keyboardType='default'
  //       />
  //       <IconFormInput
  //         iconName='pencil'
  //         iconColor='#FF6767'
  //         placeholder={`Owner`}
  //         errorMessage={
  //           ownerName.length > 0 && !this.isFieldValid(ownerName) ?
  //             'Owner name is required' : null
  //         }
  //         onChangeText={(ownerName: string) => this.setState({ ownerName })}
  //         onSubmitEditing={() => console.log('on submit editing')}
  //         keyboardType='numeric'
  //         fieldType={InputType.fieldInput}
  //         value={ownerName}
  //       />

  //       {/* TODO: add type field, don't know what it's called */}

  //     {/* TODO: load conditional fields, maybe owner is even conditional? */}
  //     </View>
  //   );
  // }

  isFieldValid(str: string) {
    if (!str || str.length === 0) {
      return false;
    }

    return true;
  }

  isResourceTypeValid(resourceType: ResourceType) {
    if (ResourceTypeArray.indexOf(resourceType) === -1) {
      return false;
    }

    return true;
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