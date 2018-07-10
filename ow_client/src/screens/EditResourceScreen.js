import React, { Component } from 'react';
import {
  View,
} from 'react-native';
import {
  FormInput,
  Input,
  FormLabel,
  FormValidationMessage,
  Button,
  Icon,
  Text
} from 'react-native-elements';
import PropTypes from 'prop-types';
import IconFormInput, { InputTypes } from '../components/common/IconFormInput';
import {
  ResourceTypes
} from '../enums';

class EditResourceScreen extends Component<Props> {

  constructor(props) {
    super(props);

    this.state = {
      isLoading: false,
      lat: '',
      lng: '',
      resourceType: 'well',
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
          onChangeText={lat => this.setState({ lat })}
          onSubmitEditing={() => console.log('on submit editing')}
          fieldType={InputTypes.fieldInput}
          value={lat}
        />
        <IconFormInput
          iconName='pencil'
          iconColor='#FF6767'
          placeholder='longitude'
          errorMessage={
            lng.length > 0 && !this.isFieldValid(lng) ?
              'Field is required' : null
          }
          onChangeText={lng => this.setState({ lng })}
          onSubmitEditing={() => console.log('on submit editing')}
          fieldType={InputTypes.fieldInput}
          value={lng}
        />
        <IconFormInput
          iconName='pencil'
          iconColor='#FF6767'
          placeholder={`Owner`}
          errorMessage={
            ownerName.length > 0 && !this.isFieldValid(ownerName) ?
              'Owner name is required' : null
          }
          onChangeText={ownerName => this.setState({ ownerName })}
          onSubmitEditing={() => console.log('on submit editing')}
          keyboardType='numeric'
          fieldType={InputTypes.fieldInput}
          value={ownerName}
        />

        {/* TODO: add type field, don't know what it's called */}

      {/* TODO: load conditional fields, maybe owner is even conditional? */}
      </View>

    );
  }

  isFieldValid(str) {
    if (!str || str.length === 0) {
      return false;
    }

    return true;
  }

  isResourceTypeValid(resourceType) {
    if (ResourceTypeArray.indexOf(resourceType) === -1) {
      return false;
    }

    return true;
  }

  shouldDistableSubmitButton() {
    const { isLoading, lat, lng, ownerName, resourceType } = this.state;

    return isLoading ||
      !this.isFieldValid(isLoading) ||
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
        titleStyle={{ fontWeight: 'bold', fontSize: 23 }}
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

EditResourceScreen.propTypes = {
  resourceId: PropTypes.string,
}

export default EditResourceScreen;