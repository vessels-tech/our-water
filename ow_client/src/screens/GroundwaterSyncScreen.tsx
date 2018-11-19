import * as React from 'react';
import { Component } from 'react';
import { Button, Text, FormValidationMessage } from 'react-native-elements';
import { ConfigFactory } from '../config/ConfigFactory';
import BaseApi from '../api/BaseApi';
import { View, TouchableNativeFeedback, ToastAndroid, ScrollView, TextStyle } from 'react-native';
import { randomPrettyColorForId, maybeLog, navigateTo } from '../utils';
import { bgLight, primaryDark, primaryText, secondaryLight, secondaryText } from '../utils/Colors';
import { SyncMeta, ActionMeta } from '../typings/Reducer';
import PassiveLoadingIndicator from '../components/common/PassiveLoadingIndicator';
import { AppState } from '../reducers';
import { UserType, MaybeUser } from '../typings/UserTypes';
import { LocationType, Location } from '../typings/Location';
import { connect } from 'react-redux'
import Loading from '../components/common/Loading';
import { isNullOrUndefined } from 'util';
import MapSection, { MapRegion } from '../components/MapSection';
import { MapStateOption } from '../enums';
import * as appActions from '../actions/index';
import MapView, { Marker, Region } from 'react-native-maps';
import ExternalServiceApi, { MaybeExternalServiceApi } from '../api/ExternalServiceApi';
import { ResultType, SomeResult } from '../typings/AppProviderTypes';
import { compose } from 'redux';
import { withTabWrapper } from '../components/TabWrapper';
import { PendingResource } from '../typings/models/PendingResource';
import { AnyLoginDetails, LoginDetailsType } from '../typings/api/ExternalServiceApi';
import { TranslationFile } from 'ow_translations';


export interface OwnProps {
  navigator: any;
  config: ConfigFactory,
  appApi: BaseApi,
}

export interface StateProps {
  pendingResources: PendingResource[],
  externalLoginDetails: AnyLoginDetails,
  externalLoginDetailsMeta: SyncMeta,
  user: MaybeUser,
  translation: TranslationFile,
}

export interface ActionProps {
  sendResourceEmail: (api: MaybeExternalServiceApi, user: MaybeUser, externalUsername: string, pendingResources: PendingResource[]) => any,
}

export interface State {
  isEmailLoading: boolean,
}

class GroundwaterSyncScreen extends Component<OwnProps & StateProps & ActionProps> {
  appApi: BaseApi;
  externalApi: MaybeExternalServiceApi;
  state: State = {
    isEmailLoading: false
  }

  constructor(props: OwnProps & StateProps & ActionProps) {
    super(props);

    //@ts-ignore
    this.appApi = props.config.getAppApi();
    this.externalApi = props.config.getExternalServiceApi();

    /* Binds */
    this.sendEmailPressed = this.sendEmailPressed.bind(this);
  }

  sendEmailPressed() {
    const { externalLoginDetails } = this.props;
    const {
      sync_email_error,
      sync_email_success,
    } = this.props.translation.templates;

    if (externalLoginDetails.type !== LoginDetailsType.FULL) {
      return;
    }

    this.setState({isEmailLoading: true}, async () => {
      const result: SomeResult<void> = await this.props.sendResourceEmail(this.externalApi, this.props.user, externalLoginDetails.username, this.props.pendingResources);
      if (result.type === ResultType.ERROR) {
        //TODO: translate the error message
        ToastAndroid.show(result.message, ToastAndroid.SHORT);
      } else {
        ToastAndroid.show(sync_email_success, ToastAndroid.SHORT);
      }

      this.setState({isEmailLoading: false});
    });
  }

  render() {
    const { externalLoginDetails } = this.props;
    const { isEmailLoading } = this.state;
    const { 
      sync_screen_heading,
      sync_screen_step_1_heading,
      sync_screen_step_1_body,
      sync_screen_step_2_heading,
      sync_screen_step_2_body,
      sync_screen_step_3_heading,
      sync_screen_step_3_body,
      sync_screen_step_4_heading,
      sync_screen_step_4_body,
      sync_screen_help_heading,
      sync_screen_help_body,
      sync_screen_send_email_button,
    } = this.props.translation.templates;

    const headingStyle: TextStyle = {
      paddingTop: 20,
      fontWeight: "600",
      color: primaryDark,
    };

    const sectionStyle = {
      paddingTop: 10,
    }

    return (
      <ScrollView
        style={{
          backgroundColor: bgLight,
          paddingHorizontal: 20,
          // paddingTop: 10,
          // paddingBottom: 10,
        }}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <Text 
          style={{
            paddingTop: 20,
            fontWeight: '600',
          }}
        >{sync_screen_heading}</Text>

        <Text style={headingStyle}>{sync_screen_step_1_heading}</Text>
        <Text style={sectionStyle}>{sync_screen_step_1_body}</Text>
        {externalLoginDetails.type === LoginDetailsType.FULL ?
          <Button
            containerViewStyle={{
              marginTop: 20,
            }}
            buttonStyle={{
              height: 50,
            }}
            loading={isEmailLoading}
            color={secondaryText}
            backgroundColor={secondaryLight}
            borderRadius={15}
            onPress={this.sendEmailPressed}
            title={sync_screen_send_email_button}
          />
        : null }
        <Text style={headingStyle}>{sync_screen_step_2_heading}</Text>
        <Text style={sectionStyle}>{sync_screen_step_2_body}</Text>
        <Text style={headingStyle}>{sync_screen_step_3_heading}</Text>
        <Text style={sectionStyle}>{sync_screen_step_3_body}</Text>
        <Text style={headingStyle}>{sync_screen_step_4_heading}</Text>
        <Text style={sectionStyle}>{sync_screen_step_4_body}</Text>
        <Text style={headingStyle}>{sync_screen_help_heading}</Text>
        <Text style={{ paddingBottom: 20, ...sectionStyle }}>{sync_screen_help_body}</Text>
      </ScrollView>
    );
  }

}

//If we don't have a user id, we should load a different app I think.
const mapStateToProps = (state: AppState, ownProps: OwnProps): StateProps => {
  let userId = ''; //I don't know if this fixes the problem...

  return {
    pendingResources: state.pendingSavedResources,
    externalLoginDetails: state.externalLoginDetails,
    externalLoginDetailsMeta: state.externalLoginDetailsMeta,
    user: state.user,
    translation: state.translation,
  }
}

const mapDispatchToProps = (dispatch: any): ActionProps => {
  return {
    sendResourceEmail: (api: MaybeExternalServiceApi, user: MaybeUser, externalUsername: string, pendingResources: PendingResource[]) => 
      dispatch(appActions.sendResourceEmail(api, user, externalUsername, pendingResources))
  };
}

// export default connect(mapStateToProps, mapDispatchToProps)(SimpleMapScreen);

const enhance = compose(
  connect(mapStateToProps, mapDispatchToProps),
);

export default enhance(GroundwaterSyncScreen);
