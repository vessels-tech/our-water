import * as React from 'react';
import { Component } from "react";
import { ConfigFactory } from "../../config/ConfigFactory";
import ExternalServiceApi, { MaybeExternalServiceApi } from "../../api/ExternalServiceApi";
import { TouchableHighlight, View, ScrollView, TouchableNativeFeedback } from 'react-native';
import { connect } from 'react-redux'
import * as appActions from '../../actions/index';
import { AppState } from '../../reducers';
import { LoginDetails, EmptyLoginDetails, ConnectionStatus, ExternalSyncStatus, ExternalSyncStatusType, AnyLoginDetails } from '../../typings/api/ExternalServiceApi';
import BaseApi from '../../api/BaseApi';
import { Text, Button, ListItem, Icon } from 'react-native-elements';
import { getGroundwaterAvatar, getReadingAvatar, showModal, navigateTo } from '../../utils';
import { error1, primary, primaryDark, bgLight, secondaryLight, secondaryText, primaryText } from '../../utils/Colors';
import * as moment from 'moment';
import { TranslationFile } from 'ow_translations/Types';
import { PendingResource } from '../../typings/models/PendingResource';
import { PendingReading } from '../../typings/models/PendingReading';

export interface OwnProps {
  navigator: any,
  userId: string,
  config: ConfigFactory,
}

export interface StateProps {
  externalLoginDetails: AnyLoginDetails,
  externalSyncStatus: ExternalSyncStatus,
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

    const syncing: boolean = externalSyncStatus.type === ExternalSyncStatusType.RUNNING;

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
        loading={syncing}
        icon={{ name: 'cached', color: primaryText }}
        title={syncing ? sync_start_sync_button_loading : sync_start_sync_button}
        onPress={() => this.props.startExternalSync(this.externalApi, this.props.userId, pendingSavedResources, pendingSavedReadings)}
      />
    )
  }

  resourceListItem(r: PendingResource, i: number) {
    return (
      <ListItem
        containerStyle={{
          paddingLeft: 6,
        }}
        key={i}
        roundAvatar
        rightIcon={
          <TouchableNativeFeedback
            onPress={() => {
              this.props.deletePendingResource(this.appApi, this.props.userId, r.id);
            }}
          >
            <Icon
              name='close'
              color={error1}
            />
          </TouchableNativeFeedback>
        }
        title={r.id}
        avatar={getGroundwaterAvatar()}
        subtitle={`${r.coords.latitude.toFixed(3), r.coords.longitude.toFixed(3)} `}/>
    );
  }

  readingListItem(r: PendingReading, i: number) {
    const { deletePendingReading, userId } = this.props;

    return (
      <ListItem
        containerStyle={{
          paddingLeft: 6,
        }}
        key={i}
        roundAvatar
        rightIcon={ 
          <TouchableNativeFeedback
            onPress={() => {deletePendingReading(this.appApi, userId, r.id)}}
          >
            <Icon
              name='close'
              color={error1}
            />
          </TouchableNativeFeedback>
        }
        title={r.id}
        avatar={getReadingAvatar()}
        subtitle={`${moment(r.date).format('DD/MM/YY @ HH:mm a')}`} />
    );
  }

  getResourcesSection() {
    const { 
      pendingSavedResources, 
      translation: { 
        templates: {
          sync_section_resources,
        } 
      }
    } = this.props;

    const sync_manual_text = 'Groundwater Stations need to be synced manually.';
    const sync_manual_show_me_how = 'Show Me How';

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
          {pendingSavedResources.map((resource, idx) => this.resourceListItem(resource, idx)) }
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
            containerViewStyle={{
              marginBottom: 40,
            }}
            buttonStyle={{
              height: 30,
            }}
            color={primaryText}
            backgroundColor={primaryDark}
            borderRadius={15}
            onPress={this.groundwaterSyncPressed}
            title={sync_manual_show_me_how}
          />
      </View>
    )
  }

  getReadingsSection() {
    const { pendingSavedReadings, translation: { templates: {
      sync_section_resources,
      sync_section_readings,
    } }
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
        {pendingSavedReadings.map((reading, idx) => this.readingListItem(reading, idx))}
      </View>
    );
  }

  getPendingItems() {
    return (
      <ScrollView
        style={{backgroundColor: bgLight}}
      >
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
        backgroundColor: 'red',
      }}>
        <View style={{
          flex: 1,
          position: "absolute",
          bottom: 15,
          // top: 0,
          right: 0,
          zIndex: 100,
        }}>
          {this.getSyncSection()}
        </View>
        {this.getPendingItems()}
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


