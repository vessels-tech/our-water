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

import {  textLight, bgMed } from '../utils/Colors';


export interface Props {

}

export interface State {
  hasPendingWrites: boolean,
}

class PendingChangesBanner extends Component<Props> {
  state: State = {
    hasPendingWrites: false,
  };

  constructor(props: Props) {
    super(props);

  }

  componentWillMount() {
    // TODO: how to we unsubscribe to this?
    //TODO: update for breaking changes: to 4.1.0 https://github.com/invertase/react-native-firebase/releases?after=v4.3.x
    // FirebaseApi.listenForPendingReadings({orgId}, (sn) => this.pendingReadingsCallback(sn));
  }

  //TODO: find the snapshot type
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

export default PendingChangesBanner;