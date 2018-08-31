import * as React from 'react';
import { Component } from "react";
import { ConfigFactory } from '../../config/ConfigFactory';
import { View, KeyboardAvoidingView, ScrollView, ToastAndroid, Keyboard } from 'react-native';
import { primaryDark, primary } from '../../utils/Colors';
import { Text, FormInput, Button } from 'react-native-elements';
import {
  FormBuilder,
  FieldGroup,
  FieldControl,
  Validators,
} from "react-reactive-form";
import BaseApi from '../../api/BaseApi';
import ExternalServiceApi from '../../api/ExternalServiceApi';
import { LoginStatus } from '../../typings/api/ExternalServiceApi';

export interface Props {
  navigator: any,
  config: ConfigFactory,
  userId: string,
  isConnected: boolean, //passed through to state
}

export interface State {
   isConnected: boolean,
   loading: boolean,
   buttonLoading: boolean, //The loading state of the submit button.
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
    <FormInput secureTextEntry={meta.secureTextEntry} placeholder={`${meta.label}`}{...handler()}/>
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

  appApi: BaseApi;
  externalApi: ExternalServiceApi;

  constructor(props: Props) {
    super(props);

    this.appApi = this.props.config.getAppApi();
    this.externalApi = this.props.config.getExternalServiceApi();

    this.state = {
      isConnected: this.props.isConnected,
      loading: true,
      buttonLoading: false,
      username: '', //TODO: get this from somewhere.
      password: '',
    };

    this.externalApi.getExternalServiceLoginDetails()
    .then(details => {
      console.log("got external login details", details);
      //TODO: update the login form if we can
      this.setState({
        loading: false,
        username: details.username,
        isConnected: details.status === LoginStatus.Success
      })
    })
    .catch(err => {
      console.log("could not get external login details", err);
      this.setState({
        loading: false,
      });
    });
  }

  handleSubmit = () => {
    Keyboard.dismiss();
    this.setState({ buttonLoading: true});

    return this.externalApi.connectToService(this.loginForm.value.username, this.loginForm.value.password)
    .then(result => {
      return this.externalApi.saveExternalServiceLoginDetails(this.loginForm.value.username, this.loginForm.value.password)
      .catch(err => console.log(err)); //non critical I suppose
    })
    .then(() => {
      this.setState({
        username: this.loginForm.value.username,
        isConnected: true,
      });
    })
    .catch(err => {
      console.log("Error logging in:", err);
      //TODO: make error message better, parse status codes.
      ToastAndroid.show(`Sorry, could not log you in. ${err.message}`, ToastAndroid.SHORT);
    })
    .then(() => this.setState({ buttonLoading: false }));
  }

  handleLogout = () => {
    this.setState({
      isConnected: false,
    });

    this.externalApi.forgetExternalServiceLoginDetails();
  }

  getLogo() {
    return (
      <View style={{
        width: '100%',
        height: '40%',
        // height: 150,
        backgroundColor: primaryDark,
        justifyContent: 'center',
      }}>
        <View style={{
          alignSelf: 'center',
          width: 100,
          height: '30%',
          backgroundColor: primary,
        }} />
      </View>
    )
  }

  getConnectedSection() {
    const { username } = this.state;

    const text = `You are connected to GGMN with username: ${username}`;
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
    const { buttonLoading } = this.state;

    return (
      <FieldGroup
        strict={false}
        control={this.loginForm}
        render={({ get, invalid }) => (
          <View>
            <FieldControl
              name="username"
              render={TextInput}
              meta={{ label: "Username", secureTextEntry: false }}
            />
            <FieldControl
              name="password"
              render={TextInput}
              meta={{ label: "Password", secureTextEntry: true }}
            />
            <Button
              style={{
                paddingBottom: 20,
              }}
              loading={buttonLoading}
              disabled={invalid}
              title={buttonLoading ? '' : 'Submit'}
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
    
        <KeyboardAvoidingView
          keyboardVerticalOffset={10}
        >
          {this.getLogo()}
          <Text style={{
            paddingHorizontal: 20,
            paddingTop: 10,
            }}>{this.props.config.getConnectToButtonDescription()}</Text>
          {isConnected ? this.getConnectedSection() : this.getForm()}
        </KeyboardAvoidingView>
    );
  }
}