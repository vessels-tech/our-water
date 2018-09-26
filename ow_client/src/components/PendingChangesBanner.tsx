/**
 * A small banner at the bottom of the screen
 * if there are pending changes to be saved to firebase,
 * it displays the count
 * 
 * For now, it only monitors the readings for the given organisation
 */

import * as React from 'react'; import { Component } from 'react';
import {
  Text,
  View,
  TouchableNativeFeedback,
} from 'react-native';
import { RNFirebase } from 'react-native-firebase';
type Snapshot = RNFirebase.firestore.QuerySnapshot;

import {  textLight, bgMed, error1, textDark, warning1 } from '../utils/Colors';
import FirebaseApi from '../api/FirebaseApi';
import { ConfigFactory } from '../config/ConfigFactory';
import BaseApi from '../api/BaseApi';
import { AppContext } from '../AppProvider';
import { SyncStatus } from '../typings/enums';
import { Reading, Resource } from '../typings/models/OurWater';
import { connect } from 'react-redux'
import * as appActions from '../actions/index';
import { AppState } from '../reducers';
import { LoginDetails, EmptyLoginDetails, ConnectionStatus } from '../typings/api/ExternalServiceApi';
import { O_SYNC } from 'constants';


export interface Props {
  onBannerPressed: any;

  //Injected from Context
  externalLoginDetails: LoginDetails | EmptyLoginDetails,
  pendingSavedReadings: Reading[],
  pendingSavedResources: Resource[],
}

export interface State {

}

const bannerHeight = 25;
 
class PendingChangesBanner extends Component<Props> {

  constructor(props: Props) {
    super(props);
  }

  getFirebaseBanner() {
    return (
      <View
        style={{
          backgroundColor: bgMed,
          width: '100%',
          height: bannerHeight,
        }}
      >
        <Text
          style={{
            color: textDark,
            textAlign: 'center',
          }}
        >
          {`Syncing changes...`}
        </Text>
      </View>
    );
  }

  getGGMNPendingBanner() {
    return (
      <View
        style={{
          backgroundColor: warning1,
          width: '100%',
          height: bannerHeight,
        }}
      >
        <Text
          style={{
            color: textDark,
            textAlign: 'center',
          }}
        >
          {`Login to GGMN to sync changes.`}
        </Text>
      </View>
    );
  }

  getGGMNBanner() {
    return (
      <View
        style={{
          backgroundColor: bgMed,
          width: '100%',
          height: bannerHeight,
        }}
      >
        <Text
          style={{
            color: textDark,
            textAlign: 'center',
          }}
        >
          {`Saving changes to GGMN...`}
        </Text>
      </View>
    );
  }

  getGGMNErrorBanner() {
    return (
      <View
        style={{
          backgroundColor: error1,
          width: '100%',
          height: bannerHeight,
        }}
      >
        <Text
          style={{
            color: textLight,
            textAlign: 'center',
            alignSelf: 'center',
          }}
        >
          {`Error saving to GGMN. Click here for more info.`}
        </Text>
      </View>
    );
  }

  computeSyncStatus(): SyncStatus {
    const { pendingSavedReadings, pendingSavedResources, externalLoginDetails } = this.props;

    if (pendingSavedReadings.length === 0 && pendingSavedResources.length === 0) {
      return SyncStatus.none;
    }

    if (externalLoginDetails.status === ConnectionStatus.SIGN_IN_ERROR) {
      return SyncStatus.ggmnError;
    }

    if (externalLoginDetails.status === ConnectionStatus.NO_CREDENTIALS) {
      return SyncStatus.pendingGGMNLogin;
    }

    return SyncStatus.pendingGGMNWrites;
  }

  render() {
    const { } = this.props;

    const syncStatus = this.computeSyncStatus();

    let innerView;

    //I don't think we should worry about local vs remote firebase syncing
    //This will be behind the scenes and not concern the user anyway
    switch (syncStatus) {
      case SyncStatus.none: {
        return null;
      }
      case SyncStatus.pendingGGMNLogin: {
        innerView = this.getGGMNPendingBanner();
        break;
      }
      case SyncStatus.pendingGGMNWrites: {
        innerView = this.getGGMNBanner();
        break;
      }
      case SyncStatus.ggmnError: {
        innerView = this.getGGMNErrorBanner();
        break;
      }
    }

    return (
      <TouchableNativeFeedback
        onPress={() => { this.props.onBannerPressed(syncStatus) }}>
        {innerView}
      </TouchableNativeFeedback>
    );
  }
}

const mapStateToProps = (state: AppState) => {

  return {
    pendingSavedReadings: state.pendingSavedReadings,
    pendingSavedResources: state.pendingSavedResources,
    externalLoginDetails: state.externalLoginDetails,
  }
}

const mapDispatchToProps = (dispatch: any) => {
  return {

  }
}


export default connect(mapStateToProps, mapDispatchToProps)(PendingChangesBanner);