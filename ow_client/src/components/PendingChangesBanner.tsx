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


export interface Props {
  onBannerPressed: any;

  //Injected from Context
  syncStatus: SyncStatus,
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
      const { syncStatus } = this.props;

      let innerView;

      switch (syncStatus) {
        case SyncStatus.none: {
          return null;
        }
        case SyncStatus.pendingFirebaseWrites: {
          innerView = this.getFirebaseBanner();
          break;
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
          onPress={() => { this.props.onBannerPressed(this.state.syncStatus) }}>
          {innerView}
        </TouchableNativeFeedback>
      );
    }
  }


const PendingChangesBannerWithContext = (props: any) => {
  return (
    <AppContext.Consumer>
      {({syncStatus}) => (
        <PendingChangesBanner 
          syncStatus={syncStatus}
          {...props}
        />
      )}
    </AppContext.Consumer>
  );
};

export default PendingChangesBannerWithContext;