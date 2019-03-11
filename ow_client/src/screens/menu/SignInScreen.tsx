import * as React from 'react';
import { Component } from "react";
import { ConfigFactory } from '../../config/ConfigFactory';
import { View, KeyboardAvoidingView, ScrollView, ToastAndroid, Keyboard, Picker } from 'react-native';
import { primaryDark, primary, error1, secondaryText, secondary, primaryLight, primaryText, bgLight, warning1 } from '../../utils/Colors';
import { Text, FormInput, Button, Divider } from 'react-native-elements';
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
import { MaybeUser, UserStatus, UserType } from '../../typings/UserTypes';
import HeadingText from '../../components/common/HeadingText';
import { greyMed } from '../../assets/ggmn/Colors';
import { default as UserAdminType } from 'ow_common/lib/enums/UserType';

export interface OwnProps {
  navigator: any,
  config: ConfigFactory,
}

export interface StateProps {
  user: MaybeUser,
  userId: string,
  userIdMeta: ActionMeta,
  userStatus: UserStatus,
  externalLoginDetails: AnyLoginDetails,
  externalLoginDetailsMeta: SyncMeta,
  externalOrgs: GGMNOrganisation[],
  externalOrgsMeta: SyncMeta,
  translation: TranslationFile,
  mobile: string | null,
  email: string | null,
  name: string | null,
  nickname: string | null,
  userType: UserAdminType,
}

export interface ActionProps {
  logout: (api: MaybeInternalAccountApi) => Promise<SomeResult<any>>,
  saveUserDetails: (api: MaybeInternalAccountApi, userId: string, userDetails: SaveUserDetailsType) => any,
  sendVerifyCode: (api: MaybeInternalAccountApi, mobile: string) => SomeResult<any>,
  verifyCodeAndLogin: (api: MaybeInternalAccountApi, userApi: UserApi, confirmResult: RNFirebase.ConfirmationResult, code: string, oldUserId: string) => SomeResult<any>,
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
    this.handleLogout = this.handleLogout.bind(this);
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
    if (props.name) {
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
    const newUserType = newProps.user.type;

    //If the user type has changed to UserType.MOBILE, then we can update the status
    if (newUserType === UserType.MOBILE_USER) {
      this.setState({ status: SignInStatus.SignedIn });
    }

    if (newUserType === UserType.USER || newUserType === UserType.NO_USER) {
      if (!newProps.userIdMeta.loading && !newProps.userIdMeta.error) {
        this.setState({ status: SignInStatus.WaitingForMobile });
      }
    }

    /* Recover the state of the profile form */
    if (newProps.name) {
      this.setState({profileStatus: ProfileStatus.Complete});
    }

    if (newProps.email) {
      this.profileForm.get('email').setValue(newProps.email);
    }

    if (newProps.nickname) {
      this.profileForm.get('nickname').setValue(newProps.nickname);
    }

    if (newProps.name) {
      this.profileForm.get('name').setValue(newProps.name);
    }
  }


  async handleLogout() {
    await this.props.logout(this.internalAccountApi);
  }

  async sendVerifyCode() {
    const mobile = this.loginForm.value.mobile;
    const result = await this.props.sendVerifyCode(this.internalAccountApi, mobile);
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
      ToastAndroid.show(result.message, ToastAndroid.LONG);
      return;
    }
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
    const { externalLoginDetails, userIdMeta: { loading, errorMessage, error } } = this.props;
    const { connect_to_error_message } = this.props.translation.templates;

    if (loading) {
      return null;
    }

    if (!error) {
      return null;
    }

    return (
      <Text style={{
        color: error1,
        paddingHorizontal: 20,
        paddingTop: 10,
      }}>
        {connect_to_error_message}
      </Text>
    );
  }

  getContent() {
    switch (this.state.status) {
      case SignInStatus.WaitingForMobile: return this.getForm();
      case SignInStatus.WaitingForPin: return this.getVerifySection();
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
      userIdMeta: { loading },
      translation: { templates: {
        connect_to_service_username_field,
        connect_to_service_username_invalid,
        connect_to_service_submit_button,
        connect_to_service_description,
        connect_to_invalid_phone_number,
      } },
    } = this.props;

    return (
      <View 
        key="loginForm"
      >
        <Text style={{
          paddingHorizontal: 20,
          paddingTop: 30,
        }}>{connect_to_service_description}</Text>
        <FieldGroup
          strict={false}
          control={this.loginForm}
          render={(control) => {
            const disabled = control.pristine || control.invalid;

            return(
              <View style={{
                paddingHorizontal: 20,
              }}>
              <FieldControl
                name="mobile"
                //@ts-ignore
                render={MobileInput}
                meta={{
                  asyncErrorMessage: connect_to_invalid_phone_number,
                  label: connect_to_service_username_field,
                  secureTextEntry: false,
                  errorMessage: connect_to_service_username_invalid,
                  keyboardType: 'phone-pad',
                }}
              />
              <Button
                raised={!disabled}
                borderRadius={4}
                style={{}}
                buttonStyle={{
                  backgroundColor: secondary,
                  minHeight: 50,
                }}
                containerViewStyle={{
                  flex: 1,
                  marginLeft: 0,
                  marginRight: 0,
                }}
                textStyle={{
                  color: disabled ? greyMed : secondaryText,
                  fontWeight: '700',
                }}
                loading={loading}
                disabled={disabled}
                title={loading ? '' : connect_to_service_submit_button}
                onPress={this.sendVerifyCode}
              />
            </View>
          )}}
        />
      </View>
    )
  }

  getVerifySection() {
    const { userIdMeta: { loading } } = this.props;
    const {
      connect_to_login_code,
      connect_to_resend,
    } = this.props.translation.templates;

    return (
      <View 
        style={{
          marginVertical: 20,
          marginHorizontal: 20,
        }}
      >
        <Text>{connect_to_login_code(this.state.mobile)}</Text>
        <CodeInput
          ref="codeInputRef2"
          secureTextEntry={true}
          codeLength={6}
          activeColor={primaryLight}
          inactiveColor={primaryText}
          autoFocus={true}
          ignoreCase={true}
          keyboardType="numeric"
          inputPosition='center'
          size={50}
          onFulfill={this.verifyCode}
          containerStyle={{ marginVertical: 30 }}
          codeInputStyle={{ borderWidth: 2 }}
        />
        <Button 
          buttonStyle={{
            backgroundColor: bgLight,
            minHeight: 50,
          }}
          containerViewStyle={{
            flex: 1,
            marginLeft: 0,
            marginRight: 0,
          }}
          textStyle={{
            color: secondary,
            fontWeight: '700',
          }}
          onPress={() => this.setState({ status: SignInStatus.WaitingForMobile })} 
          title={loading ? '' : connect_to_resend}
          loading={loading}
        />
      </View>
    )
  }

  getProfileForm() {
    const {
      connect_to_edit_heading,
      connect_to_name_label,
      connect_to_nickname_label,
      connect_to_email_label,
      connect_to_invalid_message,
      connect_to_service_submit_button
    } = this.props.translation.templates;

    return (
      <View 
        key="profileForm"
        style={{
          marginVertical: 20,
          marginHorizontal: 20,
        }}
      >
        <Text>{connect_to_edit_heading}</Text>
        <FieldGroup
          control={this.profileForm}
          render={(control) => {
            return (
              <View 
                style={{
                  marginLeft: -15,
                }}
              >
                <FieldControl
                  name="name"
                  render={TextInput}
                  meta={{ editable: true, label: connect_to_name_label, secureTextEntry: false, keyboardType: 'default' }}
                />
                <FieldControl
                  name="nickname"
                  render={TextInput}
                  meta={{ editable: true, label: connect_to_nickname_label, secureTextEntry: false, keyboardType: 'default' }}
                />
                <FieldControl
                  name="email"
                  render={TextInput}
                  meta={{ editable: true, label: connect_to_email_label, secureTextEntry: false, keyboardType: 'email-address', errorMessage: connect_to_invalid_message}}
                />
                <Button
                  style={{}}
                  buttonStyle={{
                    backgroundColor: secondary,
                    minHeight: 50,
                  }}
                  containerViewStyle={{
                    flex: 1,
                    marginLeft: 15,
                    marginRight: 0,
                  }}
                  textStyle={{
                    color: secondaryText,
                    fontWeight: '700',
                  }}
                  disabled={control.invalid}
                  title={connect_to_service_submit_button}
                  onPress={this.saveProfileForm} 
                />
              </View>
            )
          }}
        />
        {this.getSignOutButton()}
      </View>
    );
  }

  getProfile() {
    const { mobile, email, name, nickname, userStatus, userType } = this.props;
    const { 
      connect_to_signed_in_heading,
      connect_to_edit,
      connect_to_name_label,
      connect_to_nickname_label,
      connect_to_email_label,
      connect_to_profile_mobile,
      unapproved,
      approved,
      rejected,
      unapproved_description,
      approved_description,
      rejected_description,
    } = this.props.translation.templates;


    let statusText = unapproved;
    let statusDescription = unapproved_description;
    switch (userStatus) {
      case UserStatus.Approved: 
        statusText = approved;
        statusDescription = approved_description;
        break;
      case UserStatus.Rejected:
        statusText = rejected;
        statusDescription = rejected_description;
      case UserStatus.Unapproved:
        statusText = unapproved;
        statusDescription = unapproved_description;
    }

    return (
      <View
        style={{
          marginVertical: 20,
          marginHorizontal: 20,
        }}
      >
        <Text 
          style={{marginBottom: 20}}
        >{connect_to_signed_in_heading}</Text>
        <HeadingText heading={connect_to_name_label} content={name || ''}/>
        <HeadingText heading={connect_to_nickname_label} content={nickname || ''}/>
        <HeadingText heading={connect_to_profile_mobile} content={mobile || ''}/>
        <HeadingText heading={connect_to_email_label} content={email || ''}/>
        <Divider style={{marginVertical: 20}}/>
        <HeadingText heading={"User Status"} content={statusText}/>
        <Text>{statusDescription}</Text>
        {
          userType === UserAdminType.Admin ?
          <View style={{paddingTop: 10}}> 
            <HeadingText heading={"User Type"} content={"Administrator"} />
            <Text>{"You can make new measurements on any location."}</Text>
          </View>  :
            null
        }
        <Button 
          style={{}}
          buttonStyle={{
            backgroundColor: primary,
            minHeight: 50,
          }}
          containerViewStyle={{
            flex: 1,
            marginLeft: 0,
            marginRight: 0,
            paddingTop: 20,
          }}
          textStyle={{
            color: secondaryText,
            fontWeight: '700',
          }}
          onPress={() => this.setState({ status: SignInStatus.SignedIn, profileStatus: ProfileStatus.Incomplete })} 
          title={connect_to_edit} 
        />
        {this.getSignOutButton()}
      </View>
    );
  }

  getSignOutButton() {
    const { connect_to_sign_out } = this.props.translation.templates;
  
    return (
      <Button 
        style={{}}
        buttonStyle={{
          backgroundColor: error1,
          minHeight: 50,
        }}
        containerViewStyle={{
          flex: 1,
          marginLeft: 0,
          marginRight: 0,
          paddingTop: 20,
        }}
        textStyle={{
          color: secondaryText,
          fontWeight: '700',
        }}
        onPress={this.handleLogout} 
        loading={this.props.userIdMeta.loading} 
        title={connect_to_sign_out} 
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
    userStatus: state.userStatus,
    externalLoginDetails: state.externalLoginDetails,
    externalLoginDetailsMeta: state.externalLoginDetailsMeta,
    externalOrgs: state.externalOrgs,
    externalOrgsMeta: state.externalOrgsMeta,
    translation: state.translation,
    mobile: state.mobile,
    email: state.email,
    name: state.name,
    nickname: state.nickname,
    userType: state.userType,
  }
}

const mapDispatchToProps = (dispatch: any): ActionProps => {
  return {
    logout: (api: MaybeInternalAccountApi) => dispatch(appActions.logout(api)),
    saveUserDetails: (api: MaybeInternalAccountApi, userId: string, userDetails: SaveUserDetailsType) => dispatch(appActions.saveUserDetails(api, userId, userDetails)),
    sendVerifyCode: (api: MaybeInternalAccountApi, mobile: string) => {return dispatch(appActions.sendVerifyCode(api, mobile))},
    verifyCodeAndLogin: (api: MaybeInternalAccountApi, userApi: UserApi, confirmResult: RNFirebase.ConfirmationResult, code: string, oldUserId: string) => {return dispatch(appActions.verifyCodeAndLogin(api, userApi, confirmResult, code, oldUserId))},
  }
}


export default connect(mapStateToProps, mapDispatchToProps)(SignInScreen);