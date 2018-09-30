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

import {  textLight, bgMed, error1, textDark, warning1 } from '../utils/Colors';
import { SyncStatus } from '../typings/enums';
import { PendingReading, PendingResource } from '../typings/models/OurWater';
import { connect } from 'react-redux'
import { AppState } from '../reducers';
import { LoginDetails, EmptyLoginDetails, ConnectionStatus } from '../typings/api/ExternalServiceApi';


export interface OwnProps {
  onBannerPressed: any;

}

export interface StateProps {
  externalLoginDetails: LoginDetails | EmptyLoginDetails,
  pendingSavedReadings: PendingReading[],
  pendingSavedResources: PendingResource[],
}

export interface ActionProps {

}

export interface State {

}
 
class PendingChangesBanner extends Component<OwnProps & StateProps & ActionProps> {

  constructor(props: OwnProps & StateProps & ActionProps) {
    super(props);
  }

  getBanner(backgroundColor: string, message: string) {
    return (
      <View
        style={{
          backgroundColor,
          width: '100%',
        }}
      >
        <Text
          style={{
            color: textDark,
            textAlign: 'center',
            paddingVertical: 5,
          }}
        >
          {message}
        </Text>
      </View>
    );
  }

  getFirebaseBanner() {
    return this.getBanner(bgMed, `Syncing changes...`);
  }

  getGGMNPendingBanner() {
    return this.getBanner(warning1, `Login to GGMN to sync changes.`);
  }

  getGGMNBanner() {
    return this.getBanner(bgMed, `Saving changes to GGMN...`);
  }

  getGGMNErrorBanner() {
    return this.getBanner(error1, `Error saving to GGMN. Click here for more info.`);
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
    const syncStatus = this.computeSyncStatus();

    let innerView;
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

const mapStateToProps = (state: AppState): StateProps => {
  return {
    pendingSavedReadings: state.pendingSavedReadings,
    pendingSavedResources: state.pendingSavedResources,
    externalLoginDetails: state.externalLoginDetails,
  }
}


export default connect(mapStateToProps)(PendingChangesBanner);