import * as React from 'react';
import { Component } from "react";
import { ConfigFactory } from "../../config/ConfigFactory";
import ExternalServiceApi from "../../api/ExternalServiceApi";
import { TouchableHighlight, View, ScrollView, TouchableNativeFeedback } from 'react-native';
import { connect } from 'react-redux'
import * as appActions from '../../actions/index';
import { AppState } from '../../reducers';
import { LoginDetails, EmptyLoginDetails, ConnectionStatus, ExternalSyncStatus, ExternalSyncStatusType } from '../../typings/api/ExternalServiceApi';
import { Reading, Resource, PendingReading, PendingResource } from '../../typings/models/OurWater';
import BaseApi from '../../api/BaseApi';
import { Text, Button, ListItem, Icon } from 'react-native-elements';
import { getGroundwaterAvatar, getReadingAvatar } from '../../utils';
import { error1, primary, primaryDark, textDark, bgLight } from '../../utils/Colors';
import * as moment from 'moment';

export interface OwnProps {
  navigator: any,
  userId: string,
  config: ConfigFactory,
}

export interface StateProps {
  externalLoginDetails: LoginDetails | EmptyLoginDetails,
  externalSyncStatus: ExternalSyncStatus,
  pendingSavedReadings: PendingReading[],
  pendingSavedResources: PendingResource[],
}

export interface ActionProps {
  startExternalSync: any,
  deletePendingReading: (api: BaseApi, userId: string, pendingReadingId: string) => any,
  deletePendingResource: (api: BaseApi, userId: string, pendingResourceId: string) => any,
}

export interface State {

}

class SyncScreen extends Component<OwnProps & StateProps & ActionProps> {
  state: State;
  appApi: BaseApi;
  externalApi: ExternalServiceApi;

  constructor(props: OwnProps & StateProps & ActionProps) {
    super(props);

    //@ts-ignore
    this.appApi = this.props.config.getAppApi();
    this.externalApi = this.props.config.getExternalServiceApi();

    this.props.deletePendingReading.bind(this);
    this.props.deletePendingResource.bind(this);

    this.state = {};
  }

  getSyncSection() {
    const { externalLoginDetails, externalSyncStatus } = this.props;

    //if no login, just display a message saying 'login to sync'
    if (externalLoginDetails.status !== ConnectionStatus.SIGN_IN_SUCCESS) {
      return <View>
        <Text>Login to sync with GGMN</Text>
      </View>
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
          color={textDark}
          backgroundColor={primary}
          borderRadius={15}
          loading={syncing}
          icon={{ name: 'cached', color: textDark }}
          title={syncing ? 'Syncing with GGMN' : 'Start Sync'}
          onPress={() => this.props.startExternalSync(this.externalApi, this.props.userId)}
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
              this.props.deletePendingResource(this.appApi, this.props.userId, r.pendingId);
            }}
          >
            <Icon
              name='close'
              color={error1}
            />
          </TouchableNativeFeedback>
        }
        title={r.pendingId}
        avatar={getGroundwaterAvatar()}
        subtitle={`${r.owner.name} ${r.coords.latitude.toFixed(3), r.coords.longitude.toFixed(3)} `}/>
    );
  }

  readingListItem(r: PendingReading, i: number) {
    const { deletePendingReading, userId } = this.props;

    return (
      <ListItem
        containerStyle={{
          paddingLeft: 6,
        }}
        // hideChevron
        key={i}
        roundAvatar
        rightIcon={ 
          <TouchableNativeFeedback
            onPress={() => {deletePendingReading(this.appApi, userId, r.pendingId)}}
          >
            <Icon
              name='close'
              color={error1}
            />
          </TouchableNativeFeedback>
        }
        title={r.pendingId}
        avatar={getReadingAvatar()}
        subtitle={`${moment(r.createdAt).format('DD/MM/YY @ HH:mm a')}`} />
    );
  }

  getPendingItems() {
    const { pendingSavedReadings, pendingSavedResources } = this.props;

    return (
      <ScrollView
        style={{backgroundColor: bgLight}}
      >
        <Text 
          style={{
            paddingLeft: 16,
            paddingTop: 7,
            paddingBottom: 3,
            fontWeight: "400",
            color: primaryDark,
          }}
        >Groundwater Stations:</Text>
        {pendingSavedResources.map((resource, idx) => this.resourceListItem(resource, idx))}
        <Text
          style={{
            paddingLeft: 16,
            paddingTop: 7,
            paddingBottom: 3,
            fontWeight: "400",
            color: primaryDark,
          }}
        >Readings:</Text>
        {pendingSavedReadings.map((reading, idx) => this.readingListItem(reading, idx))}
      </ScrollView>
    );
  }

  render() {
    const { pendingSavedReadings, pendingSavedResources } = this.props;

    if (pendingSavedReadings.length + pendingSavedResources.length === 0) {
      return (
        <View style={{
          flex: 1,
          alignSelf: 'center',
          justifyContent: 'center',
          width: '50%',
          height: '100%',
        }}>
          <Text style={{textAlign: "center", fontWeight: 'bold', paddingBottom: 10, }}>Nothing to sync!</Text>
          <Text style={{textAlign: "center"}}>Start taking readings or creating groundwater stations to get started.</Text>
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
  }
}

const mapDispatchToProps = (dispatch: any): ActionProps => {
  return {
    startExternalSync: (api: ExternalServiceApi, userId: string) => 
      dispatch(appActions.startExternalSync(api, userId)),
    deletePendingResource: (api: BaseApi, userId: string, pendingResourceId: string) => 
      dispatch(appActions.deletePendingResource(api, userId, pendingResourceId)),
    deletePendingReading: (api: BaseApi, userId: string, pendingReadingId: string) =>
      dispatch(appActions.deletePendingReading(api, userId, pendingReadingId))
  }
}


export default connect(mapStateToProps, mapDispatchToProps)(SyncScreen);


