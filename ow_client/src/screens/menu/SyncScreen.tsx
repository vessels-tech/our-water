import * as React from 'react';
import { Component } from "react";
import { ConfigFactory } from "../../config/ConfigFactory";
import ExternalServiceApi, { MaybeExternalServiceApi } from "../../api/ExternalServiceApi";
import { TouchableHighlight, View, ScrollView, TouchableNativeFeedback, Alert } from 'react-native';
import { connect } from 'react-redux'
import * as appActions from '../../actions/index';
import { AppState } from '../../reducers';
import { LoginDetails, EmptyLoginDetails, ConnectionStatus, ExternalSyncStatusType, AnyLoginDetails, AnyExternalSyncStatus, SyncError } from '../../typings/api/ExternalServiceApi';
import BaseApi from '../../api/BaseApi';
import { Text, Button, ListItem, Icon } from 'react-native-elements';
import { getGroundwaterAvatar, getReadingAvatar, showModal, navigateTo } from '../../utils';
import { error1, primary, primaryDark, bgLight, secondaryLight, secondaryText, primaryText } from '../../utils/Colors';
import * as moment from 'moment';
import { TranslationFile } from 'ow_translations';
import { PendingResource } from '../../typings/models/PendingResource';
import { PendingReading } from '../../typings/models/PendingReading';
import { ResultType } from '../../typings/AppProviderTypes';
import ReadingListItem from '../../components/common/ReadingListItem';

export interface OwnProps {
  navigator: any,
  userId: string,
  config: ConfigFactory,
}

export interface StateProps {
  externalLoginDetails: AnyLoginDetails,
  externalSyncStatus: AnyExternalSyncStatus,
  pendingSavedReadings: PendingReading[],
  pendingSavedResources: PendingResource[],
  translation: TranslationFile,
}

export interface ActionProps {
  startExternalSync: (api: MaybeExternalServiceApi, userId: string, pendingResources: PendingResource[], pendingReadings: PendingReading[]) => any,
  deletePendingReading: (api: BaseApi, userId: string, pendingReadingId: string) => any,
  deletePendingResource: (api: BaseApi, userId: string, pendingResourceId: string) => any,
}

export interface State {

}

const getErrorMessageForSyncError = (syncError: string, translation: TranslationFile): string => {
  switch(syncError) {
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

class SyncScreen extends Component<OwnProps & StateProps & ActionProps> {
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
    this.groundwaterSyncPressed = this.groundwaterSyncPressed.bind(this);
    this.handleDeletePendingResource = this.handleDeletePendingResource.bind(this);
    this.displayDeleteResourceModal = this.displayDeleteResourceModal.bind(this);

    this.state = {};
  }

  //Bound functions
  groundwaterSyncPressed() {
    const { externalLoginDetails, externalSyncStatus,
      translation: { templates: {
        settings_sync_heading,
        sync_login_message,
        sync_start_sync_button,
        sync_start_sync_button_loading,
      } }
    } = this.props;

    // screen.GroundwaterSyncScreen
    navigateTo(
      this.props,
      'screen.GroundwaterSyncScreen',
      settings_sync_heading,
      {
        config: this.props.config,
        userId: this.props.userId,
      }
    );
  }


  getSyncSection() {
    const { 
      externalLoginDetails, 
      externalSyncStatus, 
      pendingSavedResources,
      pendingSavedReadings, 
      translation: { templates: {
        settings_sync_heading,
        sync_login_message,
        sync_start_sync_button,
        sync_start_sync_button_loading,
        sync_manual_text,
        sync_manual_show_me_how,
      }}
    } = this.props;

    //if no login, just display a message saying 'login to sync'
    if (externalLoginDetails.status !== ConnectionStatus.SIGN_IN_SUCCESS) {
      return <Button
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
            'screen.menu.ConnectToServiceScreen',
            settings_sync_heading,
            {
              config: this.props.config,
              userId: this.props.userId,
              isConnected: false, //This is an assumption, we should probably check again...
            }
          );
        }}
      />
    }

    const syncing: boolean = externalSyncStatus.status === ExternalSyncStatusType.RUNNING;

    return (
      <View>
        <Button
          containerViewStyle={{
            paddingTop: 20,
          }}
          style={{
            minHeight: 50,
          }}
          color={primaryText}
          backgroundColor={primary}
          borderRadius={15}
          loading={syncing}
          icon={syncing ? undefined : { name: 'cached', color: primaryText }}
          title={syncing ? sync_start_sync_button_loading : sync_start_sync_button}
          onPress={() => this.props.startExternalSync(this.externalApi, this.props.userId, pendingSavedResources, pendingSavedReadings)}
        />
        <Text
          style={{
            paddingLeft: 16,
            paddingTop: 7,
            paddingBottom: 3,
            fontStyle: 'italic',
            fontWeight: "400",
          }}>
          {sync_manual_text}
        </Text>
        <Button
          style={{
            minHeight: 50,
          }}
          containerViewStyle={{
            paddingBottom: 20,
          }}
          color={primaryText}
          backgroundColor={primary}
          borderRadius={15}
          onPress={this.groundwaterSyncPressed}
          title={sync_manual_show_me_how}
        />
      </View>
    )
  }

  resourceListItem(r: PendingResource, i: number, message?: string) {
    const errorMessage = message && getErrorMessageForSyncError(message, this.props.translation);

    return (
      <ListItem
        containerStyle={{
          paddingLeft: 6,
        }}
        key={i}
        roundAvatar
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
        title={r.id}
        avatar={getGroundwaterAvatar()}
        subtitle={errorMessage || `${r.coords.latitude.toFixed(3), r.coords.longitude.toFixed(3)} `}
        subtitleStyle={{ color: message ? error1 : primaryDark }}
      />
    );
  }

  displayDeleteResourceModal(resourceId: string): void {
    //TODO: translate
    const edit_resource_delete_modal_title = "Are You Sure?";
    const edit_resource_delete_modal_text = "Deleting this station will delete any associated readings, and cannot be undone.";
    const edit_resource_delete_modal_ok = "DELETE";
    const edit_resource_delete_modal_cancel = "CANCEL";

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


    return (
      <ReadingListItem
        key={i}
        deletePendingReading={(id: string) => deletePendingReading(this.appApi, this.props.userId, id)}
        pendingReading={r}
        sync_date_format={sync_date_format}
        message={message}
        errorMessage={errorMessage}
        unitSuffix=" m"
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
          }) }
         
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
      <ScrollView style={{backgroundColor: bgLight}}>
        {this.getResourcesSection()}
        {this.getReadingsSection()}
      </ScrollView>
    );
  }

  render() {
    const { pendingSavedReadings, pendingSavedResources, translation: { templates: {
      sync_empty_heading,
      sync_empty_content,
    }} } = this.props;

    if (pendingSavedReadings.length + pendingSavedResources.length === 0) {
      return (
        <View style={{
          flex: 1,
          alignSelf: 'center',
          justifyContent: 'center',
          width: '50%',
          height: '100%',
        }}>
          <Text style={{ textAlign: "center", fontWeight: 'bold', paddingBottom: 10, }}>{sync_empty_heading}</Text>
          <Text style={{ textAlign: "center" }}>{sync_empty_content}</Text>
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
    externalLoginDetails: state.externalLoginDetails,
    pendingSavedReadings: state.pendingSavedReadings,
    pendingSavedResources: state.pendingSavedResources,
    externalSyncStatus: state.externalSyncStatus,
    translation: state.translation,
  }
}

const mapDispatchToProps = (dispatch: any): ActionProps => {
  return {
    startExternalSync: (api: MaybeExternalServiceApi, userId: string, pendingResources: PendingResource[], pendingReadings: PendingReading[]) => 
      dispatch(appActions.startExternalSync(api, userId, pendingResources, pendingReadings)),
    deletePendingResource: (api: BaseApi, userId: string, pendingResourceId: string) => 
      dispatch(appActions.deletePendingResource(api, userId, pendingResourceId)),
    deletePendingReading: (api: BaseApi, userId: string, pendingReadingId: string) =>
      dispatch(appActions.deletePendingReading(api, userId, pendingReadingId))
  }
}


export default connect(mapStateToProps, mapDispatchToProps)(SyncScreen);


