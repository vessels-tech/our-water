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
import { Button } from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';

import SearchBar from './components/SearchBar';
import LoadLocationButton from './components/LoadLocationButton';
import IconButton from './components/IconButton';
import Loading from './components/Loading';

import FirebaseApi from './api/FirebaseApi';
import { 
  formatCoords, 
  pinColorForResourceType,
  getLocation,
} from './utils';

import {
  MapHeightOptions, 
  MapStateOptions
} from './enums';

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
      region: {
        latitude: 23.345,
        longitude: 23.44,
        // TODO: fine tune these numbers
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      },
      userRegion: {
        latitude: 23.345,
        longitude: 23.44,
        // TODO: fine tune these numbers
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      },
      droppedPin: false,
      droppedPinCoords: {},
      hasSavedReadings: true,
      mapHeight: MapHeightOptions.default,
      mapState: MapStateOptions.default,
    };
  }

  componentWillMount() {
    let { region } = this.state;

    this.setState({loading: true});

    getLocation()
    .then(location => {
      this.updateGeoLocation(location);
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
    //TODO: move the map to center on the pin drop
  }

  getDroppedPin() {
    const { droppedPin, droppedPinCoords } = this.state;

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

  onRegionChange(region) {
    this.setState({ region });
  }

  getMap() {
    const { userRegion, region, loading, resources, mapHeight } = this.state;

    console.log('region:', region);

    return (
      <View style={{
        flex: 3,
        backgroundColor: 'blue',
      }}>
        <MapView
          style={{
            position: 'relative',
            width: '100%',
            height: mapHeight
          }}
          onPress={e => this.onMapPressed(e.nativeEvent)}
          region={region}
          onRegionChangeComplete={(region) => this.onRegionChange(region)}
        >
          <Marker
            key='geoLocation'
            coordinate={{ latitude: userRegion.latitude, longitude: userRegion.longitude}}
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
        <View style={{
          position: 'absolute',
          width: '100%',
          height: 50,
          top: '0%',
          left: '0%',
        }}>
        {this.getSearchBar()}
        </View>

        <View style={{
          position: 'absolute',
          width: '100%',
          height: 40,
          bottom: '5%',
          left: '0%',
        }}>
          {this.getMapButtons()}
        </View>

      </View>
    );
  }

  getSearchBar() {
    return (
      <SearchBar
        onEndEditing={(text) => console.log("TODO: search, ", text)}
      />
    );
  }

  updateGeoLocation(location) {
    let region = {...this.state.region};
    let userRegion = { ...this.state.userRegion};
    
    //Move the pin to the user's location, 
    //and move the map back to where the user is
    //TODO: chang the zoom level?
    region.latitude = location.coords.latitude;
    region.longitude = location.coords.longitude;
    userRegion.latitude = location.coords.latitude;
    userRegion.longitude = location.coords.longitude;

    console.log("updating geolocation", region, userRegion);
    
    this.setState({
      region,
      userRegion,
    });
  }

  //Don't know if this will work...
  //TODO: figure out how to animate?
  toggleFullscreenMap() {
    const { mapHeight, mapState } = this.state;

    let newMapState = MapStateOptions.default;
    let newMapHeight = MapHeightOptions.default;
    
    if (mapState === MapStateOptions.default) {
      newMapState = MapStateOptions.fullscreen;
      newMapHeight = MapHeightOptions.fullscreen;
    }

    this.setState({
      mapState: newMapState,
      mapHeight: newMapHeight,
    });
  }

  clearDroppedPin() {

    this.setState({
      droppedPin: false,
      droppedPinCoords: {},
    });

    //TODO: should we re-do the search for the user?
  }

  getMapButtons() {
    const { mapHeight, mapState } = this.state;

    let fullscreenIcon = 'fullscreen';
    if (mapState === MapStateOptions.fullscreen) {
      fullscreenIcon = 'fullscreen-exit';
    }

    return (
      <View style={{
        flexDirection:'row',
        justifyContent:'space-around',
      }}>
        <LoadLocationButton
          onComplete={location => this.updateGeoLocation(location)}
        />
        <IconButton 
          name={fullscreenIcon}
          onPress={() => this.toggleFullscreenMap()}
          color="#FF6767"
        />
        <IconButton 
          name="clear"
          onPress={() => this.clearDroppedPin()}
          color="#FF6767"
        />
      </View>
    );
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
          <Loading/>
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
  }
});