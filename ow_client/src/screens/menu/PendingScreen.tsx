/**
 * PendingScreen
 *
 * This is a screen where users can view and delete pending readings and resources.
 * It is different from the SyncScreen as users are not saving resources to an external
 * service, rather the internal service.
 *
 * This is only for when users are Unapproved or Rejected.
 * If the user is already approved, then their readings will save directly.
 *
 */
import * as React from 'react';
import { Component } from "react";
import { ConfigFactory } from "../../config/ConfigFactory";
import ExternalServiceApi, { MaybeExternalServiceApi } from "../../api/ExternalServiceApi";
import { TouchableHighlight, View, ScrollView, TouchableNativeFeedback, Alert, ToastAndroid } from 'react-native';
import { connect } from 'react-redux'
import * as appActions from '../../actions/index';
import { AppState, CacheType } from '../../reducers';
import { LoginDetails, EmptyLoginDetails, ConnectionStatus, ExternalSyncStatusType, AnyLoginDetails, AnyExternalSyncStatus, SyncError, ExternalSyncStatusComplete } from '../../typings/api/ExternalServiceApi';
import BaseApi from '../../api/BaseApi';
import { Text, Button, ListItem, Icon } from 'react-native-elements';
import { getGroundwaterAvatar, getReadingAvatar, showModal, navigateTo, unwrapUserId, getShortIdOrFallback, getUnitSuffixForPendingResource } from '../../utils';
import { error1, primary, primaryDark, bgLight, primaryText } from '../../utils/Colors';
import { TranslationFile } from 'ow_translations';
import { PendingResource } from '../../typings/models/PendingResource';
import { PendingReading } from '../../typings/models/PendingReading';
import { ResultType, SomeResult } from '../../typings/AppProviderTypes';
import ReadingListItem from '../../components/common/ReadingListItem';
import { MaybeUser, UserType, UserStatus } from '../../typings/UserTypes';
import SaveButton from '../../components/common/SaveButton';
import { secondaryText, surfaceText } from '../../utils/NewColors';

export interface OwnProps {
  config: ConfigFactory,
}

export interface StateProps {
  userId: string,
  user: MaybeUser,
  userStatus: UserStatus,
  externalSyncStatus: AnyExternalSyncStatus,
  pendingSavedReadings: PendingReading[],
  pendingSavedResources: PendingResource[],
  translation: TranslationFile,
  syncing: boolean,
  shortIdCache: CacheType<string>,
}

export interface ActionProps {
  startInternalSync: (appApi: BaseApi, userId: string) => Promise<SomeResult<ExternalSyncStatusComplete>>,
  deletePendingResource: (api: BaseApi, userId: string, pendingResourceId: string) => any,
  deletePendingReading: (api: BaseApi, userId: string, pendingReadingId: string, resourceId: string) => any,
}

export interface State {

}

const getErrorMessageForSyncError = (syncError: string, translation: TranslationFile): string => {
  switch (syncError) {
    case SyncError.StationNotCreated: return translation.templates.sync_error_station_not_created;
    case SyncError.GetTimeseriesIdTransport: return translation.templates.sync_error_get_timeseries_id_transport;
    case SyncError.GetTimeseriesIdNone: return translation.templates.sync_error_get_timeseries_id_none;
    case SyncError.GetTimeseriesIdTooMany: return translation.templates.sync_error_get_timeseries_id_too_many;
    case SyncError.GetTimeseriesIdNoTimeseries: return translation.templates.sync_error_get_timeseries_id_no_timeseries;
    case SyncError.SaveReadingNotLoggedIn: return translation.templates.sync_error_save_reading_not_logged_in;
    case SyncError.GenericTransport: return translation.templates.sync_error_generic_transport;
    case SyncError.SaveReadingUnknown: return translation.templates.sync_error_save_reading_unknown;
    case SyncError.DeletePendingReading: return translation.templates.sync_error_delete_pending_reading;
    default:
      return translation.templates.sync_error_unknown;
  }
}

class PendingScreen extends Component<OwnProps & StateProps & ActionProps> {
  state: State;
  appApi: BaseApi;
  externalApi: MaybeExternalServiceApi;

  constructor(props: OwnProps & StateProps & ActionProps) {
    super(props);

    //@ts-ignore
    this.appApi = this.props.config.getAppApi();
    this.externalApi = this.props.config.getExternalServiceApi();

    /* Binds */
    this.props.deletePendingReading.bind(this);
    this.props.deletePendingResource.bind(this);
    this.handleDeletePendingResource = this.handleDeletePendingResource.bind(this);
    this.displayDeleteResourceModal = this.displayDeleteResourceModal.bind(this);
    this.startInternalSync = this.startInternalSync.bind(this);

    this.state = {};
  }

  async startInternalSync() {
    const {
      sync_error_message
    } = this.props.translation;

    const result = await this.props.startInternalSync(this.appApi, this.props.userId);
    if (result.type === ResultType.ERROR) {
      ToastAndroid.show(sync_error_message, ToastAndroid.LONG);
    }
  }

  getSyncSection() {
    const { user, userStatus, externalSyncStatus, pendingSavedResources, pendingSavedReadings } = this.props;
    const {
      sync_login_message,
      sync_start_sync_button,
      sync_start_sync_button_loading,
      settings_connect_to_pending_title,
      pending_status_rejected,
      pending_status_unapproved,
      pending_status_approved
    } = this.props.translation.templates;

    //if no login, just display a message saying 'login to sync'
    //Don't think this is possible for MyWell
    if (user.type === UserType.NO_USER) {
      return (
        <Button
          style={{
            paddingBottom: 20,
            minHeight: 50,
          }}
          containerViewStyle={{
            borderRadius: 15,
            position: 'relative',
          }}
          color={primaryText}
          backgroundColor={primary}
          borderRadius={15}
          icon={{ name: 'cached', color: primaryText }}
          title={sync_login_message}
          onPress={() => {
            //Redirect user to settings view
            showModal(
              this.props,
              'screen.menu.SignInScreen',
              settings_connect_to_pending_title,
              {
                config: this.props.config,
                userId: this.props.userId,
                isConnected: false, //This is an assumption, we should probably check again...
              }
            );
          }}
        />
      );
    }

    let statusText = pending_status_approved;
    if (userStatus === UserStatus.Rejected) {
      statusText = pending_status_rejected;
    }

    if (userStatus === UserStatus.Unapproved) {
      statusText = pending_status_unapproved;
    }

    const syncing: boolean = externalSyncStatus.status === ExternalSyncStatusType.RUNNING;
    const approved: boolean = userStatus === UserStatus.Approved;

    return (
      <View>
        <Text style={{ padding: 20 }}>
          {statusText}
        </Text>
        { approved &&
          <SaveButton
            loading={syncing}
            icon={syncing ? undefined : { name: 'cached', color: secondaryText.high }}
            disabled={false}
            title={syncing ? sync_start_sync_button_loading : sync_start_sync_button}
            onPress={this.startInternalSync}
            height={50}
          />
        }
      </View>
    );
  }

  resourceListItem(r: PendingResource, i: number, message?: string) {
    const errorMessage = message && getErrorMessageForSyncError(message, this.props.translation);

    return (
      <ListItem
        containerStyle={{
          paddingLeft: 6,
        }}
        key={i}
        roundAvatar={true}
        rightIcon={
          <TouchableNativeFeedback
            onPress={() => this.displayDeleteResourceModal(r.id)}
          >
            <Icon
              name='close'
              color={error1}
            />
          </TouchableNativeFeedback>
        }
        title={getShortIdOrFallback(r.id, this.props.shortIdCache)}
        avatar={getGroundwaterAvatar()}
        subtitle={errorMessage || `${r.coords.latitude.toFixed(3)}, ${r.coords.longitude.toFixed(3)}`}
        subtitleStyle={{ color: message ? error1 : primaryDark }}
      />
    );
  }

  displayDeleteResourceModal(resourceId: string): void {
    const {
      edit_resource_delete_modal_title,
      edit_resource_delete_modal_text,
      edit_resource_delete_modal_ok,
      edit_resource_delete_modal_cancel,
    } = this.props.translation.templates;

    Alert.alert(
      edit_resource_delete_modal_title,
      edit_resource_delete_modal_text,
      [
        { text: edit_resource_delete_modal_ok, onPress: () => this.handleDeletePendingResource(resourceId) },
        { text: edit_resource_delete_modal_cancel, onPress: () => { } }
      ],
      { cancelable: true }
    );
  }

  handleDeletePendingResource(resourceId: string) {
    this.props.deletePendingResource(this.appApi, this.props.userId, resourceId);
  }

  readingListItem(r: PendingReading, i: number, message?: string) {
    const { deletePendingReading } = this.props;
    const { sync_date_format } = this.props.translation.templates;
    const errorMessage = message && getErrorMessageForSyncError(message, this.props.translation);
    const unitSuffix = getUnitSuffixForPendingResource(r, this.props.config);

    return (
      <ReadingListItem
        key={i}
        deletePendingReading={(id: string) => deletePendingReading(this.appApi, this.props.userId, id, r.resourceId)}
        pendingReading={r}
        sync_date_format={sync_date_format}
        message={message}
        errorMessage={errorMessage}
        unitSuffix={unitSuffix}
        shortId={getShortIdOrFallback(r.resourceId, this.props.shortIdCache)}
      />
    )
  }

  getResourcesSection() {
    const {
      pendingSavedResources,
      externalSyncStatus,
      translation: {
        templates: {
          sync_section_resources,
        }
      }
    } = this.props;
    const {
      sync_manual_text,
      sync_manual_show_me_how,
    } = this.props.translation.templates;

    if (pendingSavedResources.length === 0) {
      return null;
    }

    return (
      <View>
        <Text
          style={{
            paddingLeft: 16,
            paddingTop: 7,
            paddingBottom: 3,
            fontWeight: "600",
            color: primaryDark,
          }}
        >{sync_section_resources}
        </Text>
        {pendingSavedResources.map((resource, idx) => {
          let message: string | undefined;
          if (externalSyncStatus.status === ExternalSyncStatusType.COMPLETE) {
            const result = externalSyncStatus.pendingResourcesResults[resource.id];
            if (result && result.type === ResultType.ERROR) {
              message = result.message;
            }
          }
          return this.resourceListItem(resource, idx, message);
        })}

      </View>
    )
  }

  getReadingsSection() {
    const {
      pendingSavedReadings,
      translation: {
        templates: {
          sync_section_resources,
          sync_section_readings,
        }
      },
      externalSyncStatus,
    } = this.props;

    if (pendingSavedReadings.length === 0) {
      return null;
    }

    return (
      <View>
        <Text
          style={{
            paddingLeft: 16,
            paddingTop: 7,
            paddingBottom: 3,
            fontWeight: "600",
            color: primaryDark,
          }}
        >{sync_section_readings}</Text>
        {pendingSavedReadings.map((reading, idx) => {
          let message: string | undefined;
          if (externalSyncStatus.status === ExternalSyncStatusType.COMPLETE) {
            const result = externalSyncStatus.pendingReadingsResults[reading.id];
            if (result && result.type === ResultType.ERROR) {
              message = result.message;
            }
          }
          return this.readingListItem(reading, idx, message);
        })}
      </View>
    );
  }

  getPendingItems() {
    return (
      <ScrollView style={{ backgroundColor: bgLight }}>
        {this.getResourcesSection()}
        {this.getReadingsSection()}
      </ScrollView>
    );
  }

  render() {
    const { pendingSavedReadings, pendingSavedResources, translation: { templates: {
      sync_empty_heading,
      sync_empty_content,
    } } } = this.props;

    if (pendingSavedReadings.length + pendingSavedResources.length === 0) {
      return (
        <View style={{
          flex: 1,
          alignSelf: 'center',
          justifyContent: 'center',
          paddingHorizontal: 35,
          height: '100%',
        }}>
          <Text style={{ color: surfaceText.high, textAlign: "left", fontWeight: '800', fontSize: 22, paddingBottom: 10 }}>{sync_empty_heading}</Text>
          <Text style={{ color: surfaceText.med, textAlign: "left", fontWeight: '400', fontSize: 15, paddingBottom: 10,  }}>{sync_empty_content}</Text>
        </View>
      );
    }


    return (
      <View style={{
        flexDirection: 'column',
        height: '100%',
      }}>
        {this.getPendingItems()}
        {this.getSyncSection()}
      </View>
    );
  }
}

const mapStateToProps = (state: AppState) => {
  return {
    userStatus: state.userStatus,
    user: state.user,
    userId: unwrapUserId(state.user),
    pendingSavedReadings: state.pendingSavedReadings,
    pendingSavedResources: state.pendingSavedResources,
    externalSyncStatus: state.externalSyncStatus,
    translation: state.translation,
    shortIdCache: state.shortIdCache,
  }
}

const mapDispatchToProps = (dispatch: any): ActionProps => {
  return {
    startInternalSync: (appApi: BaseApi, userId: string) =>
      dispatch(appActions.startInternalSync(appApi, userId)),
    deletePendingResource: (api: BaseApi, userId: string, pendingResourceId: string) =>
      dispatch(appActions.deletePendingResource(api, userId, pendingResourceId)),
    deletePendingReading: (api: BaseApi, userId: string, pendingReadingId: string, resourceId: string) =>
      dispatch(appActions.deletePendingReading(api, userId, pendingReadingId, resourceId))
  }
}


export default connect(mapStateToProps, mapDispatchToProps)(PendingScreen);


