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
} from 'react-native';
import { RNFirebase } from 'react-native-firebase';
type Snapshot = RNFirebase.firestore.QuerySnapshot;

import { textLight, bgMed } from '../utils/Colors';
import FirebaseApi from '../api/FirebaseApi';
import { ConfigFactory } from '../config/ConfigFactory';
import BaseApi from '../api/BaseApi';


export interface Props {
  config: ConfigFactory;
  userId: string,

}

export interface State {
  hasPendingWrites: boolean,
}


/*TODO: reimplement this for GGMN - if we are syncing to firebase, display 'saving', if we have pending writes that 
are being saved to ggmn, display 'syncing with GGMN', if we have pendingReadings in the user object, but are not logged in
or there is some error, display 'Error syncing with GGMN'. Pressing on banner will bring up a nice modal with tips etc.
*/
export default class PendingChangesBanner extends Component<Props> {
  appApi: BaseApi;
  listener: any;

  state: State = {
    hasPendingWrites: false,
  };

  constructor(props: Props) {
    super(props);
    this.appApi = this.props.config.getAppApi();

  }

  componentWillMount() {
    // TODO: how to we unsubscribe to this?
    //TODO: update for breaking changes: to 4.1.0 https://github.com/invertase/react-native-firebase/releases?after=v4.3.x
    this.listener = this.appApi.listenForPendingReadings(this.props.userId, (sn: Snapshot) => this.pendingReadingsCallback(sn));
    // FirebaseApi.listenForPendingReadings({orgId}, (sn) => this.pendingReadingsCallback(sn));
  }

  componentWillUnmount() {
    this.listener.unsubscribe();
  }

  pendingReadingsCallback(sn: Snapshot) {

    this.setState({
      hasPendingWrites: sn.metadata.hasPendingWrites,
    });
  }

  render() {
    if (!this.state.hasPendingWrites) {
      return null;
    }

    return (
      <View
        style={{
          backgroundColor: bgMed,
          width: '100%',
          height: 20,
        }}
      >
        <Text
          style={{
            color: textLight,
            textAlign: 'center',
          }}
        >
          {`Syncing changes...`}
        </Text>
      </View>
    );
  }
}