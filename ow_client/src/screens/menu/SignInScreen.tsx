import * as React from 'react';
import { Component } from "react";
import { ConfigFactory } from '../../config/ConfigFactory';
import { View, KeyboardAvoidingView, ScrollView, ToastAndroid, Keyboard, Picker } from 'react-native';
import { primaryDark, primary, error1, secondaryText, secondary } from '../../utils/Colors';
import { Text, FormInput, Button } from 'react-native-elements';
import {
  FormBuilder,
  FieldGroup,
  FieldControl,
  Validators,
} from "react-reactive-form";
import BaseApi from '../../api/BaseApi';
import ExternalServiceApi, { MaybeExternalServiceApi } from '../../api/ExternalServiceApi';
import { LoginDetails, EmptyLoginDetails, ConnectionStatus, LoginDetailsType, AnyLoginDetails } from '../../typings/api/ExternalServiceApi';
import { SomeResult, ResultType } from '../../typings/AppProviderTypes';
import { connect } from 'react-redux'
import * as appActions from '../../actions/index';
import { AppState } from '../../reducers';
import { SyncMeta } from '../../typings/Reducer';
import { TextInput } from '../../components/common/FormComponents';
import { GGMNOrganisation } from '../../typings/models/GGMN';
import Loading from '../../components/common/Loading';
import { TranslationFile } from 'ow_translations';


export interface OwnProps {
  navigator: any,
  config: ConfigFactory,
  userId: string,
}

export interface StateProps {
  externalLoginDetails: AnyLoginDetails,
  externalLoginDetailsMeta: SyncMeta,
  externalOrgs: GGMNOrganisation[],
  externalOrgsMeta: SyncMeta,
  translation: TranslationFile,
}

export interface ActionProps {
  connectToExternalService: any,
  disconnectFromExternalService: any,
  setExternalOrganisation: any,
}


export interface State {
  mobile: string,
  password: string,
}

/**
 * SignInScreen allows users to sign in using a given authentication method
 */
class SignInScreen extends Component<OwnProps & StateProps & ActionProps> {
  state: State;
  loginForm: any;
  appApi: BaseApi;
  externalApi: MaybeExternalServiceApi;

  constructor(props: OwnProps & StateProps & ActionProps) {
    super(props);


    //@ts-ignore
    this.appApi = this.props.config.getAppApi();
    this.externalApi = this.props.config.getExternalServiceApi();

    let mobile = '';
    if (this.props.externalLoginDetails.type === LoginDetailsType.FULL) {
      mobile = this.props.externalLoginDetails.username;
    }
    this.state = {
      mobile,
      password: '',
    };

    this.loginForm = FormBuilder.group({
      mobile: [mobile, Validators.required],
      password: ["", Validators.required],
    });
  }

  componentWillReceiveProps(newProps: OwnProps & StateProps & ActionProps) {
    const { mobile } = this.state;
    const { externalLoginDetails } = newProps;

    // if (externalLoginDetails.type === LoginDetailsType.FULL) {

    //   //Update the username if we found a saved one.
    //   if (mobile !== externalLoginDetails.username) {
    //     this.setState({ username: externalLoginDetails.username });
    //     // this.loginForm.get('username').setValue(externalLoginDetails.username);
    //   }
    // }
  }

  handleSubmit = async () => {
    Keyboard.dismiss();

    // const result: SomeResult<null> = await this.props.connectToExternalService(this.externalApi, this.loginForm.value.username, this.loginForm.value.password);

    this.setState({
      mobile: this.loginForm.value.mobile,
    });
  }

  handleLogout = () => {
    // this.props.disconnectFromExternalService(this.externalApi);
  }

  getLogo() {
    return (
      <View style={{
        alignSelf: 'center',
        width: 100,
        height: '30%',
        backgroundColor: primary,
      }} />
    )
  }

  /**
   * If the user was previously logged in but something went wrong, display an error message
   */
  getErrorMessage() {
    const { externalLoginDetails, externalLoginDetailsMeta: { loading } } = this.props;

    if (loading) {
      return null;
    }

    if (externalLoginDetails.status !== ConnectionStatus.SIGN_IN_ERROR) {
      return null;
    }

    return (
      <Text style={{
        color: error1,
        paddingHorizontal: 20,
        paddingTop: 10,
      }}>
        here
        Error signing in. Please try again.
      </Text>
    );
  }


  getConnectedSection() {
    //TODO: depending on the login state, display the incomplete form, or the user's details


    return null;

    let { username } = this.state;
    const { externalLoginDetails, translation: { templates: {
      connect_to_service_connected_test,
      connect_to_service_logout_button
    } } } = this.props;

    if (externalLoginDetails.status !== ConnectionStatus.SIGN_IN_SUCCESS) {
      return null;
    }

    if (username.length === 0) {
      username = externalLoginDetails.username;
    }

    const text = connect_to_service_connected_test('username', username);
    return (
      <View
        style={{
          flex: 5,
        }}
      >
        <Text
          style={{
            paddingHorizontal: 20,
            paddingVertical: 10,
          }}
        >
          {text}
        </Text>
        {this.getExternalOrgSelector()}
        <Button
          style={{
            paddingBottom: 20,
            minHeight: 50,
          }}
          buttonStyle={{
            backgroundColor: secondary,
          }}
          textStyle={{
            color: secondaryText,
            fontWeight: '700',
          }}
          title={connect_to_service_logout_button}
          onPress={() => this.handleLogout()}
        />
      </View>
    );
  }

  getForm() {
    const {
      externalLoginDetailsMeta: { loading },
      translation: { templates: {
        connect_to_service_username_field,
        connect_to_service_username_invalid,
        connect_to_service_password_field,
        connect_to_service_password_invalid,
        connect_to_service_submit_button
      } },
    } = this.props;

    return (
      <FieldGroup
        strict={false}
        control={this.loginForm}
        render={({ get, invalid }) => (
          <View>
            <FieldControl
              name="mobile"
              render={TextInput}
              meta={{
                label: connect_to_service_username_field,
                secureTextEntry: false,
                errorMessage: connect_to_service_username_invalid
              }}
            />
            <Button
              style={{
                paddingBottom: 20,
                minHeight: 50,
              }}
              buttonStyle={{
                backgroundColor: secondary,
              }}
              textStyle={{
                color: secondaryText,
                fontWeight: '700',
              }}
              loading={loading}
              disabled={invalid}
              title={loading ? '' : connect_to_service_submit_button}
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
    const { externalLoginDetails, translation: {
      templates: {
        connect_to_service_description
      } }
    } = this.props;

    const isConnected = externalLoginDetails.status === ConnectionStatus.SIGN_IN_SUCCESS;
    return (
      <ScrollView
        style={{
          flexDirection: 'column',
          // height: '100%',
        }}
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps={'always'}
      >
        {/* I don't like the logo here anymore */}
        {/* {Logo(this.props.config.getApplicationName())} */}
        {/* Text */}
        <View style={{
          flex: 2
        }}>
          <Text style={{
            paddingHorizontal: 20,
            paddingTop: 30,
          }}>{connect_to_service_description}</Text>
          {this.getErrorMessage()}
          {this.getConnectedSection()}
        </View>

        {/* Form  */}
        <View style={{ flex: 5 }}>
          {isConnected ? null : this.getForm()}
        </View>
      </ScrollView>
    );
  }
}

const mapStateToProps = (state: AppState): StateProps => {

  return {
    externalLoginDetails: state.externalLoginDetails,
    externalLoginDetailsMeta: state.externalLoginDetailsMeta,
    externalOrgs: state.externalOrgs,
    externalOrgsMeta: state.externalOrgsMeta,
    translation: state.translation,
  }
}

const mapDispatchToProps = (dispatch: any): ActionProps => {
  return {
    connectToExternalService: (api: MaybeExternalServiceApi, username: string, password: string) => { dispatch(appActions.connectToExternalService(api, username, password)) },

    disconnectFromExternalService: (api: MaybeExternalServiceApi) => { dispatch(appActions.disconnectFromExternalService(api)) },

    setExternalOrganisation: (api: MaybeExternalServiceApi, organisation: GGMNOrganisation) => { dispatch(appActions.setExternalOrganisation(api, organisation)) }
  }
}


export default connect(mapStateToProps, mapDispatchToProps)(SignInScreen);