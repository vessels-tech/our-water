import * as React from 'react';
import { Component } from "react";
import { ConfigFactory } from '../../config/ConfigFactory';
import { View, KeyboardAvoidingView, ScrollView, ToastAndroid, Keyboard, Picker } from 'react-native';
import { primaryDark, primary, error1, secondaryText, secondary, primaryLight, primaryText } from '../../utils/Colors';
import { Text, FormInput, Button } from 'react-native-elements';
import {
  FormBuilder,
  FieldGroup,
  FieldControl,
  Validators,
  AbstractControl,
} from "react-reactive-form";
/* required for reactive-form */
import "core-js/es6/symbol";
import "core-js/fn/symbol/iterator";

import BaseApi from '../../api/BaseApi';
import ExternalServiceApi, { MaybeExternalServiceApi } from '../../api/ExternalServiceApi';
import { LoginDetails, EmptyLoginDetails, ConnectionStatus, LoginDetailsType, AnyLoginDetails } from '../../typings/api/ExternalServiceApi';
import { SomeResult, ResultType } from '../../typings/AppProviderTypes';
import { connect } from 'react-redux'
import * as appActions from '../../actions/index';
import { AppState } from '../../reducers';
import { SyncMeta, ActionMeta } from '../../typings/Reducer';
import { TextInput, MobileInput } from '../../components/common/FormComponents';
import { GGMNOrganisation } from '../../typings/models/GGMN';
import { TranslationFile } from 'ow_translations';
import { phoneNumberValidator, unwrapUserId } from '../../utils';
import Loading from '../../components/common/Loading';
import CodeInput from 'react-native-confirmation-code-input';
import { invalid } from 'moment';
import { MaybeInternalAccountApi, SaveUserDetailsType } from '../../api/internalAccountApi';
import { RNFirebase } from 'react-native-firebase';
import Config from 'react-native-config';
import UserApi from '../../api/UserApi';
import { MaybeUser, UserType } from '../../typings/UserTypes';

export interface OwnProps {
  navigator: any,
  config: ConfigFactory,
}

export interface StateProps {
  user: MaybeUser,
  userId: string,
  userIdMeta: ActionMeta,
  externalLoginDetails: AnyLoginDetails,
  externalLoginDetailsMeta: SyncMeta,
  externalOrgs: GGMNOrganisation[],
  externalOrgsMeta: SyncMeta,
  translation: TranslationFile,
  mobile: string | null,
  email: string | null,
  name: string | null,
  nickname: string | null,
}

export interface ActionProps {
  connectToExternalService: any,
  disconnectFromExternalService: any,
  setExternalOrganisation: any,
  sendVerifyCode: (api: MaybeInternalAccountApi, mobile: string) => SomeResult<any>,
  verifyCodeAndLogin: (api: MaybeInternalAccountApi, userApi: UserApi, confirmResult: RNFirebase.ConfirmationResult, code: string, oldUserId: string) => SomeResult<any>,
  saveUserDetails: (api: MaybeInternalAccountApi, userId: string, userDetails: SaveUserDetailsType) => any,
}

export enum SignInStatus {
  WaitingForMobile = 'WaitingForMobile',
  WaitingForPin = 'WaitingForPin',
  SignedIn = 'SignedIn',
}

export enum ProfileStatus {
  Incomplete = 'Incomplete',
  Complete = 'Complete',
}

export interface State {
  mobile: string,
  password: string,
  status: SignInStatus,
  profileStatus: ProfileStatus,
}

/**
 * SignInScreen allows users to sign in using a given authentication method
 */
class SignInScreen extends Component<OwnProps & StateProps & ActionProps> {
  state: State;
  appApi: BaseApi;
  userApi: UserApi;
  loginForm: any;
  internalAccountApi: MaybeInternalAccountApi;
  profileForm: any;
  confirmResult: RNFirebase.ConfirmationResult | null = null;
  
  constructor(props: OwnProps & StateProps & ActionProps) {
    super(props);


    //@ts-ignore
    this.appApi = this.props.config.getAppApi();
    this.userApi = this.props.config.userApi;
    this.internalAccountApi = this.props.config.getInternalAccountApi();

    /* binds */
    this.sendVerifyCode = this.sendVerifyCode.bind(this);
    this.verifyCode = this.verifyCode.bind(this);
    this.saveProfileForm = this.saveProfileForm.bind(this);

    //TODO: figure out if we are already signed in, and if we are check to see if the profile is complete or not.
    let mobile = '';
    if (props.mobile) {
      mobile = props.mobile;
    }

    let status: SignInStatus = SignInStatus.WaitingForMobile;
    if (props.user.type === UserType.MOBILE_USER) {
      status = SignInStatus.SignedIn;
    }

    let profileStatus = ProfileStatus.Incomplete;
    if (props.email && props.name) {
      profileStatus = ProfileStatus.Complete;
    }

    this.state = {
      mobile,
      password: '',
      status,
      profileStatus,
    };


    //TODO: update form to respect this value
    this.loginForm = FormBuilder.group({
      mobile: [mobile, Validators.required, phoneNumberValidator],
    });

    this.profileForm = FormBuilder.group({
      name: [props.name || '', Validators.required],
      nickname: [props.nickname || ''],
      email: [props.email || '', Validators.email]
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

  async sendVerifyCode() {
    const mobile = this.loginForm.value.mobile;
    const result = await this.props.sendVerifyCode(this.internalAccountApi, mobile);
    console.log("result is", result);
    if (result.type === ResultType.ERROR) {
      ToastAndroid.show(result.message, ToastAndroid.SHORT);
      return;
    }

    this.confirmResult = result.result;

    this.setState({ status: SignInStatus.WaitingForPin, mobile });
  }

  async verifyCode(code: string) {
    if (!this.confirmResult) {
      return
    }

    const result = await this.props.verifyCodeAndLogin(this.internalAccountApi, this.userApi, this.confirmResult, code, this.props.userId);
    if (result.type === ResultType.ERROR) {
      ToastAndroid.show(result.message, ToastAndroid.SHORT);
      return;
    }

    this.setState({ status: SignInStatus.SignedIn })
  }

  async saveProfileForm() {
    if (this.props.user.type === UserType.NO_USER) {
      return;
    }

    this.setState({ status: SignInStatus.SignedIn, profileStatus: ProfileStatus.Complete });

    const userDetails: SaveUserDetailsType = {
      name: this.profileForm.value.name,
      nickname: this.profileForm.value.nickname,
      email: this.profileForm.value.email,
    };

    console.log("saving user details", userDetails);
    this.props.saveUserDetails(this.internalAccountApi, this.props.user.userId, userDetails);
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

    //TODO: Translate
    return (
      <Text style={{
        color: error1,
        paddingHorizontal: 20,
        paddingTop: 10,
      }}>
        Error signing in. Please try again.
      </Text>
    );
  }

  getContent() {
    switch (this.state.status) {
      case SignInStatus.WaitingForMobile: {
        return this.getForm();
      }
      case SignInStatus.WaitingForPin: {
        return this.getVerifySection();
      }
      case SignInStatus.SignedIn: {
        switch(this.state.profileStatus) {
          case ProfileStatus.Incomplete: {
            return this.getProfileForm();
          }
          case ProfileStatus.Complete: {
            return this.getProfile();
          }
        }
      }
    }
  }

  getForm() {
    const {
      externalLoginDetailsMeta: { loading },
      translation: { templates: {
        connect_to_service_username_field,
        connect_to_service_username_invalid,
        connect_to_service_submit_button,
        connect_to_service_description
      } },
    } = this.props;

    return (
      <View>
        <Text style={{
          paddingHorizontal: 20,
          paddingTop: 30,
        }}>{connect_to_service_description}</Text>
        <FieldGroup
          control={this.loginForm}
          render={(control) => {
            return(
            <View>
              <FieldControl
                name="mobile"
                render={MobileInput}
                meta={{
                  //TODO: translate
                  asyncErrorMessage: 'Phone number is invalid',
                  label: connect_to_service_username_field,
                  secureTextEntry: false,
                  errorMessage: connect_to_service_username_invalid,
                  keyboardType: 'phone-pad',
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
                disabled={control.pristine || control.invalid}
                title={loading ? '' : connect_to_service_submit_button}
                //TODO: Send verify message
                onPress={this.sendVerifyCode}
              />
            </View>
          )}}
        />
      </View>
    )
  }

  getVerifySection() {
    return (
      <View>
        <Text>Enter the login code we sent to {this.state.mobile}.</Text>
        {/* TODO: do this implicitly */}
        <CodeInput
          ref="codeInputRef2"
          secureTextEntry
          codeLength={6}
          activeColor={primaryLight}
          inactiveColor={primaryText}
          autoFocus={true}
          ignoreCase={true}
          inputPosition='center'
          size={50}
          onFulfill={this.verifyCode}
          containerStyle={{ marginVertical: 30 }}
          codeInputStyle={{ borderWidth: 1.5 }}
        />
        <Button onPress={() => this.setState({ status: SignInStatus.WaitingForMobile })}  title="Didn't get the text?"/>
      </View>
    )
  }

  getProfileForm() {
    return (
      <View>
        <Text>Tell Us More About Yourself</Text>
        <FieldGroup
          control={this.profileForm}
          render={(control) => {
            return (
              <View>
                <FieldControl
                  name="name"
                  render={TextInput}
                  meta={{ editable: true, label: 'Full Name', secureTextEntry: false, keyboardType: 'default' }}
                />
                <FieldControl
                  name="nickname"
                  render={TextInput}
                  meta={{ editable: true, label: 'Short Name', secureTextEntry: false, keyboardType: 'default' }}
                />
                <FieldControl
                  name="email"
                  render={TextInput}
                  meta={{ editable: true, label: 'Email', secureTextEntry: false, keyboardType: 'email-address'}}
                />
                <Button 
                  onPress={this.saveProfileForm} 
                  title="Save" 
                  // disabled={control.pristine || control.invalid}
                />
              </View>
            )
          }}
        />

        
        {/* TODO: do this implicitly */}
        <Button onPress={() => this.setState({ status: SignInStatus.WaitingForMobile })} title="Sign Out" />
      </View>
    );
  }

  getProfile() {
    return (
      <View>
        <Text>You are signed in.</Text>
        <Button onPress={() => this.setState({ status: SignInStatus.SignedIn, profileStatus: ProfileStatus.Incomplete })} title="Edit" />
        <Button onPress={() => this.setState({ status: SignInStatus.WaitingForMobile })} title="Logout" />
      </View>
    );
  }

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
        }}
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps={'always'}
      >
        <View style={{
          flex: 2
        }}>
          {this.getErrorMessage()}
          {this.getContent()}
        </View>
      </ScrollView>
    );
  }
}

const mapStateToProps = (state: AppState): StateProps => {

  return {
    user: state.user,
    userId: unwrapUserId(state.user),
    userIdMeta: state.userIdMeta,
    externalLoginDetails: state.externalLoginDetails,
    externalLoginDetailsMeta: state.externalLoginDetailsMeta,
    externalOrgs: state.externalOrgs,
    externalOrgsMeta: state.externalOrgsMeta,
    translation: state.translation,
    mobile: state.mobile,
    email: state.email,
    name: state.name,
    nickname: state.nickname,
  }
}

const mapDispatchToProps = (dispatch: any): ActionProps => {
  return {
    connectToExternalService: (api: MaybeExternalServiceApi, username: string, password: string) => { dispatch(appActions.connectToExternalService(api, username, password)) },
    disconnectFromExternalService: (api: MaybeExternalServiceApi) => { dispatch(appActions.disconnectFromExternalService(api)) },
    setExternalOrganisation: (api: MaybeExternalServiceApi, organisation: GGMNOrganisation) => { dispatch(appActions.setExternalOrganisation(api, organisation)) },
    sendVerifyCode: (api: MaybeInternalAccountApi, mobile: string) => {return dispatch(appActions.sendVerifyCode(api, mobile))},
    verifyCodeAndLogin: (api: MaybeInternalAccountApi, userApi: UserApi, confirmResult: RNFirebase.ConfirmationResult, code: string, oldUserId: string) => {return dispatch(appActions.verifyCodeAndLogin(api, userApi, confirmResult, code, oldUserId))},
    saveUserDetails: (api: MaybeInternalAccountApi, userId: string, userDetails: SaveUserDetailsType) => dispatch(appActions.saveUserDetails(api, userId, userDetails)),
  }
}


export default connect(mapStateToProps, mapDispatchToProps)(SignInScreen);