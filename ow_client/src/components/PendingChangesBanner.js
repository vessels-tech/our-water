/**
 * A small banner at the bottom of the screen
 * if there are pending changes to be saved to firebase,
 * it displays the count
 * 
 * For now, it only monitors the readings for the given organisation
 */

import React, { Component } from 'react';
import {
  ActivityIndicator,
  Text,
  View,
  TextInput,
  Image,
} from 'react-native';
import { Button, Icon } from 'react-native-elements';
import PropTypes from 'prop-types';
import Config from 'react-native-config'

import FirebaseApi from '../api/FirebaseApi';

const orgId = Config.REACT_APP_ORG_ID;

class PendingChangesBanner extends Component<Props> {

  constructor(props) {
    super(props);

    this.state = {
      hasPendingWrites: false,
    };
  }

  componentWillMount() {
    // TODO: how to we unsubscribe to this?
    FirebaseApi.listenForPendingReadings({orgId}, (sn) => this.pendingReadingsCallback(sn));
  }

  pendingReadingsCallback(sn) {
    
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
          backgroundColor: 'black',
          width: '100%',
          height: 20,
        }}
      >
        <Text
          style={{
            color: 'white',
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