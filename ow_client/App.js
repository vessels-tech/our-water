/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  ScrollView,
  Text,
  View
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import firebase from 'react-native-firebase';

import SearchBar from './components/SearchBar';

import FirebaseApi from './api/FirebaseApi';
import { 
  formatCoords, 
  pinColorForResourceType,
  getLocation,
} from './utils';

import Config from 'react-native-config'
const orgId = Config.REACT_APP_ORG_ID;

type Props = {};
export default class App extends Component<Props> {
  

  constructor(props) {
    super(props);
    this.fs = firebase.firestore();
    console.log(Config.REACT_APP_ORG_ID);

    FirebaseApi.getResourcesForOrg({orgId});

    this.state = {
      loading: true,
      coords: {
        latitude: 23.345,
        longitude: 23.44,
      },
      droppedPin: false,
      droppedPinCoords: {},
      hasSavedReadings: true,
    };
  }

  componentWillMount() {
    const { coords } = this.state;

    this.setState({loading: true});

    getLocation()
    .then(location => {
      console.log('location', location);

      this.setState({
        coords: location.coords,
      });

      return FirebaseApi.getResourceNearLocation({orgId, ...location.coords, distance: 1});
    })
    .then(resources => {
      console.log(resources);
      this.setState({
        loading: false,
        resources
      });
    })
    .catch(err => {
      console.log(err);
    });
  }

  onMapPressed({coordinate}) {

    this.setState({
      droppedPin: true,
      droppedPinCoords: coordinate,
    });

    //TODO: reload the resources based on pin drop + zoom level
  }

  getDroppedPin() {
    const { droppedPin, droppedPinCoords } = this.state;

    console.log("dropped pin?", droppedPin);

    if (!droppedPin) {
      return false;
    }

    return (
      <Marker
        key='droppedPin'
        coordinate={droppedPinCoords}
        title='Your Pin'
        pinColor="#D9E3F0"
      />
    );
  }

  getMap() {
    const { coords, loading, resources } = this.state;

    return (
      <View style={{
        flex: 3,
        backgroundColor: 'blue',
      }}>
        <MapView
          style={styles.map}
          onPress={e => this.onMapPressed(e.nativeEvent)}
          initialRegion={{
            ...coords,
            latitudeDelta: 10,
            longitudeDelta: 10,
          }}
        >
          <Marker
            key='geoLocation'
            coordinate={coords}
            title='Me'
            pinColor="#4A90E2"
          />
          {this.getDroppedPin()}
          {resources.map(resource => (
            <Marker
              key={resource.id}
              coordinate={formatCoords(resource.coords)}
              title={resource.id}
              description={resource.type}
              pinColor={pinColorForResourceType(resource.type)}
            />
          ))}
        </MapView>
      </View>
    );
  }

  getSearchBar() {
    return (
      <View style={{
        backgroundColor: '#D9E3F0',
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
      }}>
        <SearchBar
          onEndEditing={(text) => console.log("TODO: search, ", text)}
        />
      </View>
    )
  }

  getFavouritesList() {
    return (
      <View style={{
        backgroundColor: '#D9E3F0',
        justifyContent: 'center',
        alignItems: 'center',
        flex: 5,
      }}>
        <Text>Recents</Text>
      </View>
    )
  }

  getResourceView() {
    return (
      <View style={{
        backgroundColor: '#D9E3F0',
        //TODO: change this back at some stage
        height:700
      }}>
        {this.getSearchBar()}
        {this.getFavouritesList()}
      </View>
    );
  }

  getSavedReadingsButton() {
    const { hasSavedReadings } = this.state;

    if (!hasSavedReadings) {
      return null;
    }

    return (
      <View style={{
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
      }}>
        <Text>Saved Readings</Text>
      </View>
    );
  }
  
  render() {
    const { coords, loading, resources } = this.state;

    if (loading) {
      return (
        <View style={{
          justifyContent: 'center',
          alignItems: 'center',
          flex: 1
        }}>
          <Text style={{
          }}>
            Loading...
          </Text>
        </View>
      );
    }

    return (
      <ScrollView style={styles.container}>
        {this.getMap()}
        {this.getResourceView()}
        {this.getSavedReadingsButton()}
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    marginTop: 0,
    flex: 1
  },
  map: {
    position: 'relative',
    width: '100%',
    height: 400,
    // top: 0,
    // left: 0,
    // right: 0,
    // bottom: 0,
  },
});