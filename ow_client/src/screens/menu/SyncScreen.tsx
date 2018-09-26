import * as React from 'react';
import { Component } from "react";
import { ConfigFactory } from "../../config/ConfigFactory";
import ExternalServiceApi from "../../api/ExternalServiceApi";
import { TouchableHighlight, View } from 'react-native';
import { connect } from 'react-redux'
import * as appActions from '../../actions/index';
import { AppState } from '../../reducers';
import { LoginDetails, EmptyLoginDetails, ConnectionStatus, ExternalSyncStatus, ExternalSyncStatusType } from '../../typings/api/ExternalServiceApi';
import { Reading, Resource } from '../../typings/models/OurWater';
import BaseApi from '../../api/BaseApi';
import { Text, Button } from 'react-native-elements';



export interface Props {
  navigator: any,
  userId: string,
  config: ConfigFactory,
  externalLoginDetails: LoginDetails | EmptyLoginDetails,
  externalSyncStatus: ExternalSyncStatus,
  pendingSavedReadings: Reading[],
  pendingSavedResources: Resource[],

  startExternalSync: any,
}

export interface State {

}

class SyncScreen extends Component<Props> {
  state: State;
  appApi: BaseApi;
  externalApi: ExternalServiceApi;

  constructor(props: Props) {
    super(props);

    //@ts-ignore
    this.appApi = this.props.config.getAppApi();
    this.externalApi = this.props.config.getExternalServiceApi();

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
        loading={syncing}
        title={syncing ? 'Syncing with GGMN' : 'Submit'}
        onPress={() => this.props.startExternalSync(this.externalApi, this.props.userId)}
      />
    )
  }

  render() {
    return (
      <View>
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
  }
}

const mapDispatchToProps = (dispatch: any) => {
  return {
    startExternalSync: (api: ExternalServiceApi, userId: string) => 
      dispatch(appActions.startExternalSync(api, userId))
  }
}


export default connect(mapStateToProps, mapDispatchToProps)(SyncScreen);


