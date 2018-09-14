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
import { AppContext, SyncMeta } from '../../AppProvider';
import { LoginDetails, EmptyLoginDetails, ConnectionStatus, LoginDetailsType } from '../../typings/api/ExternalServiceApi';

export interface Props {
  navigator: any,
  config: ConfigFactory,
  userId: string,
  isConnected: boolean, //passed through to state,
  connectToExternalService: any,
  disconnectFromExternalService: any,
  externalLoginDetails: LoginDetails | EmptyLoginDetails,
  externalLoginDetailsMeta: SyncMeta,
}

export interface State {
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
class ConnectToServiceScreen extends Component<Props> {
  state: State;
  loginForm: any;
  appApi: BaseApi;
  externalApi: ExternalServiceApi;

  constructor(props: Props) {
    super(props);

    this.appApi = this.props.config.getAppApi();
    this.externalApi = this.props.config.getExternalServiceApi();

    let username = '';
    if (this.props.externalLoginDetails.type === LoginDetailsType.FULL) {
      username = this.props.externalLoginDetails.username;
    }
    this.state = {
      username,
      password: '',
    };

    this.loginForm = FormBuilder.group({
      username: [this.state.username, Validators.required],
      password: ["", Validators.required],
    });
  }

  handleSubmit = () => {
    Keyboard.dismiss();

    return this.props.connectToExternalService(this.loginForm.value.username, this.loginForm.value.password)
    .then(() => {
      this.setState({
        username: this.loginForm.value.username,
      });
    })
  }

  handleLogout = () => {
    this.props.disconnectFromExternalService();
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
    const { externalLoginDetailsMeta: { loading }} = this.props;

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
              loading={loading}
              disabled={invalid}
              title={loading ? '' : 'Submit'}
              onPress={() => this.handleSubmit()}
            />
          </View>
        )}
      />
    )
  }

  // TODO: when to display this?
  // ToastAndroid.show(`Sorry, could not log you in. ${err.message}`, ToastAndroid.SHORT);

  render() {
    const { externalLoginDetails } = this.props;

    const isConnected = externalLoginDetails.status !== ConnectionStatus.NO_CREDENTIALS;
    //TODO: handle the login error case!
  
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

const ConnectToServiceScreenWithContext = (props: any) => {
  return (
    <AppContext.Consumer>
      {({
        externalLoginDetails,
        externalLoginDetailsMeta,
        action_connectToExternalService,
        action_disconnectFromExternalService,
      }) => (
          <ConnectToServiceScreen
            externalLoginDetails={externalLoginDetails}
            externalLoginDetailsMeta={externalLoginDetailsMeta}
            connectToExternalService={action_connectToExternalService}
            disconnectFromExternalService={action_disconnectFromExternalService}
            {...props}
          />
        )}
    </AppContext.Consumer>
  );
};

export default ConnectToServiceScreenWithContext;