import * as React from 'react';
import { Component } from "react";
import { ConfigFactory } from '../../config/ConfigFactory';
import { View, KeyboardAvoidingView, ScrollView } from 'react-native';
import { primaryDark, primary } from '../../utils/Colors';
import { Text, FormInput, Button } from 'react-native-elements';
import {
  FormBuilder,
  FieldGroup,
  FieldControl,
  Validators,
} from "react-reactive-form";

export interface Props {
  navigator: any,
  config: ConfigFactory,
  userId: string,
  isConnected: boolean, //passed through to state
}

export interface State {
   isConnected: boolean,
   loading: boolean,
   username: string,
   password: string,
 }

export type TextInputParams = {
  handler: any, 
  touched: boolean,
  hasError: boolean,
  meta: any,
}

const TextInput = ({meta, handler}: any) => (
  <View>
    <FormInput placeholder={`${meta.label}`}{...handler()}/>
  </View>
)

/**
 * ConnectToServiceScreen is a page allowing users to connect to external services
 * and manage their connection with these services.
 * 
 * For now, this implementation will be very GGMN-Specific, but can be adapted for other 
 * external services as OurWater expands.
 */
export default class ConnectToServiceScreen extends Component<Props> {
  state: State;
  loginForm = FormBuilder.group({
    username: ["", Validators.required],
    password: ["", Validators.required],
  });

  constructor(props: Props) {
    super(props);

    this.state = {
      isConnected: this.props.isConnected,
      loading: false,
      username: 'lewisiscool', //TODO: get this from somewhere.
      password: '',
    }
  }

  handleSubmit = () => {
    this.setState({loading: true});
    console.log("Form values", this.loginForm.value);

    //TODO: talk to the api, and validate the user's login
    //Then save to firebase!

    setTimeout(() => this.setState({loading: false}), 300);
  }

  handleLogout = () => {
    this.setState({
      isConnected: false,
    });
  }

  getLogo() {
    return (
      <View style={{
        width: '100%',
        height: 150,
        backgroundColor: primaryDark,
      }}>
        <View style={{
          alignSelf: 'center',
          marginTop: 25,
          width: 100,
          height: 100,
          backgroundColor: primary,
        }} />
      </View>
    )
  }

  getConnectedSection() {
    const { username } = this.state;

    const text = `You are already connected to GGMN with username: ${username}`;
    return (
      <View>
        <Text>{text}</Text>
        <Button
          title='Log out'
          onPress={() => this.handleLogout()}
        />
      </View>
    );
  }

  getForm() {
    const { loading } = this.state;
    console.log("getForm, loading:", loading);

    return (
      <FieldGroup
        strict={false}
        control={this.loginForm}
        render={({ get, invalid }) => (
          <View>
            <FieldControl
              name="username"
              render={TextInput}
              meta={{ label: "Username" }}
            />
            <FieldControl
              name="password"
              render={TextInput}
              meta={{ label: "Password" }}
            />
            {/* TODO: add loading indicator, disable feature */}
            <Button
              loading={loading}
              disabled={invalid}
              title='Submit' 
              onPress={() => this.handleSubmit()}
            />
          </View>
        )}
      />
    )
  }


  render() {
    const { isConnected } = this.state;
  

    return (
      <ScrollView>
        {/* TODO: button is still being partly obscured by keyboard */}
        <KeyboardAvoidingView>
          {this.getLogo()}
          <Text>{this.props.config.getConnectToButtonText()}</Text>
          <Text>{this.props.config.getConnectToButtonDescription()}</Text>
          {isConnected ? this.getConnectedSection() : this.getForm()}
        </KeyboardAvoidingView>
      </ScrollView>
    );
  }
}