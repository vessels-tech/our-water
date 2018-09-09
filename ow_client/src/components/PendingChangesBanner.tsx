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


export enum BannerState {
  none = 'none', //No changes need be saved or anything
  pendingFirebaseWrites = 'pendingFirebaseWrites', //We have pending writes that haven't been saved to firebase yet
  pendingGGMNLogin = 'pendingGGMNLogin', //User has tried to save, but isn't logged into ggmn
  pendingGGMNWrites = 'pendingGGMNWrites', //We have pending writes that have been saved to firebase, but not to GGMN
  ggmnError = 'ggmnError', //There was an error saving readings to ggmn.
}

export interface Props {
  config: ConfigFactory;
  userId: string,
  onBannerPressed: any;
}

export interface State {
  bannerState: BannerState,
}

const bannerHeight = 25;

export default function PendingChangesBannerFactory(config: ConfigFactory) {
 
  class PendingChangesBanner extends Component<Props> {
    appApi: BaseApi;
    subscriptionId: string | null = null;

    state: State = {
      bannerState: BannerState.none,
    };

    constructor(props: Props) {
      super(props);
      this.appApi = config.getAppApi();

    }

    componentWillMount() {
      this.subscriptionId = config.getAppApi().subscribeToPendingReadings(this.props.userId, (bs: BannerState) => this.pendingReadingsCallback(bs))
    }

    componentWillUnmount() {
      if (this.subscriptionId) {
        console.log("unsubscribing!");
        this.appApi.unsubscribeFromPendingReadings(this.subscriptionId);
      }
    }

    pendingReadingsCallback(bannerState: BannerState) {
      console.log("pendingReadingsCallback", bannerState);
      
      this.setState({
        bannerState
      });
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
      const { bannerState } = this.state;

      let innerView;

      switch (bannerState) {
        case BannerState.none: {
          return null;
        }
        case BannerState.pendingFirebaseWrites: {
          innerView = this.getFirebaseBanner();
          break;
        }
        case BannerState.pendingGGMNLogin: {
          innerView = this.getGGMNPendingBanner();
          break;
        }
        case BannerState.pendingGGMNWrites: {
          innerView = this.getGGMNBanner();
          break;
        }
        case BannerState.ggmnError: {
          innerView = this.getGGMNErrorBanner();
          break;
        }
      }

      return (
        <TouchableNativeFeedback
          onPress={() => { this.props.onBannerPressed(this.state.bannerState) }}>
          {innerView}
        </TouchableNativeFeedback>
      );
    }
  }

  return PendingChangesBanner;
}

