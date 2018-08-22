import React, { Component } from 'react';
import {
  View,
} from 'react-native';
import {
  FormInput,
  FormLabel,
  FormValidationMessage,
  Button
} from 'react-native-elements';
import PropTypes from 'prop-types';
import IconFormInput, { InputType } from '../components/common/IconFormInput';
import { ResourceTypeArray, ResourceType } from '../enums';

export interface Props { 
  resourceId: string,
}

export interface State {
  isLoading: boolean,
  lat: string,
  lng: string,
  resourceType: ResourceType,
  ownerName: string,
 }


class EditResourceScreen extends Component<Props> {
  state: State;

  constructor(props: Props) {
    super(props);

    this.state = {
      isLoading: false,
      lat: '',
      lng: '',
      resourceType: ResourceType.well,
      ownerName: '',
    };
    
  }

  //TODO: load the resource if we already have the id

  getForm() {
    const { lat, lng, resourceType, ownerName} = this.state;

    return (
      <View style={{
        width: '100%',
        flexDirection: 'column'
      }}>
        <IconFormInput
          iconName='pencil'
          iconColor='#FF6767'
          placeholder='latitude'
          errorMessage={
            lat.length > 0 && !this.isFieldValid(lat) ?
              'Field is required' : null
          }
          onChangeText={(lat: string) => this.setState({ lat })}
          onSubmitEditing={() => console.log('on submit editing')}
          fieldType={InputType.fieldInput}
          value={lat}
          keyboardType='default'
        />
        <IconFormInput
          iconName='pencil'
          iconColor='#FF6767'
          placeholder='longitude'
          errorMessage={
            lng.length > 0 && !this.isFieldValid(lng) ?
              'Field is required' : null
          }
          onChangeText={(lng: string) => this.setState({ lng })}
          onSubmitEditing={() => console.log('on submit editing')}
          fieldType={InputType.fieldInput}
          value={lng}
          keyboardType='default'
        />
        <IconFormInput
          iconName='pencil'
          iconColor='#FF6767'
          placeholder={`Owner`}
          errorMessage={
            ownerName.length > 0 && !this.isFieldValid(ownerName) ?
              'Owner name is required' : null
          }
          onChangeText={(ownerName: string) => this.setState({ ownerName })}
          onSubmitEditing={() => console.log('on submit editing')}
          keyboardType='numeric'
          fieldType={InputType.fieldInput}
          value={ownerName}
        />

        {/* TODO: add type field, don't know what it's called */}

      {/* TODO: load conditional fields, maybe owner is even conditional? */}
      </View>
    );
  }

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

  shouldDistableSubmitButton() {
    const { isLoading, lat, lng, resourceType } = this.state;

    return isLoading ||
      !this.isFieldValid(lat) ||
      !this.isFieldValid(lng) ||
      !this.isResourceTypeValid(resourceType)
  }

  getSubmitButton() {
    return (
      <Button
        buttonStyle={{
          backgroundColor: '#FF6767',
          borderRadius: 5,
          flex: 1,
          padding: 30,
          // marginBottom: 20
        }}
        // containerViewStyle={{ fontWeight: 'bold', fontSize: 23 }}
        title='Save'
        onPress={() => console.log("Save Pressed")}
      />
    )
  }

  render() {
    return (
      <View style={{
        flexDirection: 'column',
        marginTop: 20,
        justifyContent: 'space-around',
        backgroundColor: 'white',
        height: '100%',
        width: '100%'
      }}>
        {this.getForm()}
        {this.getSubmitButton()}
      </View>
    );
  }
}

//TODO: load existing resource for edit

export default EditResourceScreen;