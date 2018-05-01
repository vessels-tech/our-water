/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View
} from 'react-native';
import MapView from 'react-native-maps';
import firebase from 'react-native-firebase';


import FirebaseApi from './api/FirebaseApi';

import Config from 'react-native-config'
const orgId = Config.REACT_APP_ORG_ID;

type Props = {};
export default class App extends Component<Props> {
  

  constructor(props) {
    super(props);
    this.fs = firebase.firestore();
    console.log(Config.REACT_APP_ORG_ID);

    FirebaseApi.getResourcesForOrg({orgId});
  }

  componentWillMount() {

    //TODO: get from user
    const coords = {
      latitude: 24.345,
      longitude: 55.44,
    };

    FirebaseApi.getResourceNearLocation({orgId, ...coords, distance: 1})
    .then(result => {
      console.log(result);
    })
    .catch(err => {
      console.log(err);
    });
  }

  
  render() {

    return (
      <View style={styles.container}>
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: 37.78825,
            longitude: -122.4324,
            latitudeDelta: 0.015,
            longitudeDelta: 0.0121,
          }}
        />
        <Text>Hello</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  map: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});