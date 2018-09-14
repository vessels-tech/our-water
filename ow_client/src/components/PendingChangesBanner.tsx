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


export interface Props {
  onBannerPressed: any;

  //Injected from Context
  syncStatus: SyncStatus,
  pendingSavedReadings: Reading[],
  pendingSavedResources: Resource[],
}

export interface State {
  syncStatus: SyncStatus,
}

const bannerHeight = 25;

// export default function PendingChangesBannerFactory(config: ConfigFactory) {
 
  export class PendingChangesBanner extends Component<Props> {

    state: State = {
      syncStatus: SyncStatus.none,
    };

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

    render() {
      const { syncStatus, pendingSavedReadings, pendingSavedResources } = this.props;
      console.log("PendingChangesBanner, syncStatus is", syncStatus);

      // let syncStatus
      // if (pendingSavedReadings.length + pendingSavedResources.length > 0){
        
      // }

      let innerView;

      //I don't think we should worry about local vs remote firebase syncing
      //This will be behind the scenes and not concern the user anyway
      switch (syncStatus) {
        case SyncStatus.none: {
          return null;
        }
        // case SyncStatus.pendingFirebaseWrites: {
        //   innerView = this.getFirebaseBanner();
        //   break;
        // }
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
          onPress={() => { this.props.onBannerPressed(this.state.syncStatus) }}>
          {innerView}
        </TouchableNativeFeedback>
      );
    }
  }


const PendingChangesBannerWithContext = (props: any) => {
  return (
    <AppContext.Consumer>
      {({ syncStatus, pendingSavedReadings, pendingSavedResources}) => (
        <PendingChangesBanner 
          syncStatus={syncStatus}
          pendingSavedReadings={pendingSavedReadings}
          pendingSavedResources={pendingSavedResources}
          {...props}
        />
      )}
    </AppContext.Consumer>
  );
};

export default PendingChangesBannerWithContext;