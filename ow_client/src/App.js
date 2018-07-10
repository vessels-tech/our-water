/**
 * Main OurWater App
 * @flow
 */

import React, { Component } from 'react';
import {
  BackHandler,
  Platform,
  StyleSheet,
  ScrollView,
  Text,
  View
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import firebase from 'react-native-firebase';
import { Button, Icon } from 'react-native-elements';
import { Navigation } from 'react-native-navigation';

import SearchBar from './components/SearchBar';
import LoadLocationButton from './components/LoadLocationButton';
import IconButton from './components/IconButton';
import Loading from './components/Loading';
import ResourceDetailSection from './components/ResourceDetailSection';
import ResoureMarker from './components/common/ResourceMarker';
import PendingChangesBanner from './components/PendingChangesBanner';
import FavouriteResourceList from './components/FavouriteResourceList';

import FirebaseApi from './api/FirebaseApi';
import { 
  formatCoords, 
  pinColorForResourceType,
  getLocation,
  getSelectedResourceFromCoords,
  navigateTo,
  getShortId,
} from './utils';

import {
  MapHeightOptions, 
  MapStateOptions,
  ResourceTypes
} from './enums';

import Config from 'react-native-config'
import NetworkApi from './api/NetworkApi';
import { bgLight, primary, bgDark, bgMed, bgDark2, textDark } from './utils/Colors';
const orgId = Config.REACT_APP_ORG_ID;

type Props = {};
export default class App extends Component<Props> {

  constructor(props) {
    super(props);
    this.fs = firebase.firestore();
    this.networkApi = new NetworkApi();

    this.state = {
      loading: true,
      region: {
        latitude: 23.345,
        longitude: 23.44,
        latitudeDelta: 0.5,
        longitudeDelta: 0.25,
      },
      userRegion: {
        latitude: 23.345,
        longitude: 23.44,
        latitudeDelta: 0.5,
        longitudeDelta: 0.25,
      },
      droppedPin: false,
      droppedPinCoords: {},
      hasSavedReadings: false,
      
      mapHeight: MapHeightOptions.default,
      mapState: MapStateOptions.default,

      hasSelectedResource: false,
      selectedResource: {},
      
      isSearching: false,

      isAuthenticated: false,
      userId: ''
    };
  }

  componentWillMount() {
    let { region } = this.state;
    console.log("IS MOUNTING");

    this.hardwareBackListener = BackHandler.addEventListener('hardwareBackPress', () => this.hardwareBackPressed());

    this.setState({loading: true});

    FirebaseApi.signIn()
    .then(siginData => {
      this.setState({ 
        isAuthenticated: true,
        userId: siginData.user.uid,
      });
      return getLocation();
    })
    .catch(err => {
      console.log("error signing in", err);
      this.setState({ isAuthenticated: false });
      return getLocation();
    })
    .then(location => {
      this.updateGeoLocation(location);
      return FirebaseApi.getResourceNearLocation(this.networkApi, {orgId, ...location.coords, distance: 0.1});
    })
    .then(resources => {
      console.log("Done loading?");
      this.setState({
        loading: false,
        resources
      });
    })
    .catch(err => {
      console.log(err);
    });
  }

  hardwareBackPressed() {
    if (this.state.hasSelectedResource) {
      this.clearSelectedResource();
      return true;
    }

    return false;
  }

  onMapPressed({coordinate}) {
    const { mapState } = this.state;

    //Don't drop a marker if the map is in small mode, 
    //just make the map bigger, and deselect the resource
    if (mapState === MapStateOptions.small) {
      this.setState({
        mapState: MapStateOptions.default,
        mapHeight: MapHeightOptions.default,
        selectedResource: {},
        hasSelectedResource: false,
      });

      return;
    }

    this.setState({
      droppedPin: true,
      droppedPinCoords: coordinate,
    });

    //TODO: should probably present a 'mini loading indicator'
    return FirebaseApi.getResourceNearLocation(this.networkApi, { orgId, ...coordinate, distance: 0.1 })
      .then(resources => {
        this.setState({
          loading: false,
          resources
        });
      })
      .catch (err => {
        console.log(err);
      });
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
        image={require('./assets/my_pin.png')}
      />
    );
  }

  onRegionChange(region) {
    this.setState({ region });
  }

  imageForResourceType(type) {
    switch (type) {
      case ResourceTypes.checkdam:
        return require('./assets/checkdam_pin.png');
      case ResourceTypes.raingauge:
        return require('./assets/raingauge_pin.png');
      case ResourceTypes.well:
        return require('./assets/well_pin.png');
      case ResourceTypes.custom:
        return require('./assets/other_pin.png')
    }
  }

  /**
   * When user clicks on a resource, make the map small, 
   * scroll to the top of the view, and display the resource details
   * 
   * @param {*} param0 
   */
  focusResource({coordinate, position}) {
    const resource = getSelectedResourceFromCoords(this.state.resources, coordinate);
    this.selectResource(resource);
  }

  selectResource(resource) {
    this.setState({
      mapHeight: MapHeightOptions.small,
      mapState: MapStateOptions.small,
      hasSelectedResource: true,
      selectedResource: resource
    });

    //Do in the background - we don't care when
    FirebaseApi.addRecentResource({ orgId, resource, userId: this.state.userId });
  }

  getMap() {
    const { userRegion, region, loading, resources, mapHeight } = this.state;

    return (
      <View style={{
        backgroundColor: bgMed,
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
            image={require('./assets/my_location.png')}
          />
          {this.getDroppedPin()}
          {resources.map(resource => {
              const shortId = getShortId(resource.id);
              return <Marker
              key={shortId}
                coordinate={formatCoords(resource.coords)}
                title={`${shortId}`}
                description={resource.type}
                image={this.imageForResourceType(resource.type)}
                onPress={(e) => this.focusResource(e.nativeEvent)}
              />
            }
          )}
        </MapView>
        <View style={{
          position: 'absolute',
          width: '100%',
          height: 40,
          bottom: '5%',
          left: '0%',
        }}>
          {this.getMapButtons()}
          {this.getUpButton()}
        </View>

      </View>
    );
  }

  getTopBar() {
    const { mapState } = this.state;

    //Hide this when the map is small
    if (mapState === MapStateOptions.small) {
      return null;
    }

    return (
      <View style={{
        backgroundColor: bgDark2,
        width: '100%',
        height: 50,
        flexDirection: 'row'
      }}>
        {this.getMenuButton()}
        {this.getSearchBar()}
      </View>
    );
  }

  getMenuButton() {
    const { mapState } = this.state;

    return (
      <Icon
        size={30}
        name="menu"
        onPress={() => {
          navigateTo(this.props, 'screen.SettingsScreen', 'Settings', {});
        }}
        iconStyle={{
          color: textDark,
        }}
        underlayColor='transparent'
        containerStyle={{
          // backgroundColor: 'transparent',

          marginLeft: 10
        }}
      />
    );
  }

  getSearchBar() {
    return (
      <SearchBar
        containerStyle={{
          flex: 1,
          width: '100%',
          backgroundColor: 'transparent'
        }}
        onEndEditing={() => console.log("TODO: dismiss and finish search")}
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

  clearSelectedResource() {

    this.setState({
      mapState: MapStateOptions.default,
      mapHeight:MapHeightOptions.default,
      hasSelectedResource: false,
      selectedResource: {},
    });
  }

  getMapButtons() {
    const { mapHeight, mapState, droppedPin } = this.state;

    //Hide these buttons when the map is in small mode
    if (mapState === MapStateOptions.small) {
      //TODO: fade out nicely
      return null;
    }

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
        />
        {droppedPin ? 
          <IconButton 
            name="clear"
            onPress={() => this.clearDroppedPin()}
          />
          : null }
      </View>
    );
  }

  getFavouritesList() {
    const { userId, hasSelectedResource } = this.state;

    //Hide when we are looking at a resource
    if (hasSelectedResource) {
      return null;
    }

    return (  
      <FavouriteResourceList
        userId={this.state.userId}
        onResourceCellPressed={(resource) => {
          //TODO: move the map to select this resource
          this.selectResource(resource);
        }}
      />
    );
  }

  //A button for the user to deselect a resource, and exit out
  //of small map mode
  getUpButton() {
    const { hasSelectedResource, selectedResource } = this.state;

    if (!hasSelectedResource) {
      return null;
    }

    return (
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-around',
      }}>
      <IconButton
        name="clear"
        onPress={() => this.clearSelectedResource()}
      />
      </View>
    );
  }

  getResourceView() {
    const {hasSelectedResource, selectedResource, userId} = this.state;

    if (!hasSelectedResource) {
      return null;
    }

    return (
      <View style={{
        backgroundColor: bgLight,
        //TODO: change this back at some stage
        // height:1000
      }}>
        <ResourceDetailSection
          userId={userId}
          resource={selectedResource}
          onMorePressed={resource => {
            navigateTo(this.props, 'screen.ResourceDetailScreen', 'Details', {
              legacyId: resource.legacyId,
            });
          }}
          onAddToFavourites={() => console.log('onAddToFavourites')}
          onRemoveFromFavourites={() => console.log('onRemoveFromFavourites')}
          onAddReadingPressed={resource => {
            navigateTo(this.props, 'screen.NewReadingScreen', 'New Reading', {
              resource, 
            });
          }} 
        />
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
          flex: 1,
          backgroundColor: bgLight,
        }}>
          <Loading/>
        </View>
      );
    }

    return (
      <View style={{
        marginTop: 0,
        flex: 1,
        backgroundColor: bgLight,
      }}>
        {this.getTopBar()}
        {this.getMap()}
        <ScrollView style={{
            marginTop: 0,
            flex: 1
          }}
        >
          {this.getResourceView()}
          {this.getFavouritesList()}
          {this.getSavedReadingsButton()}
        </ScrollView>
        <PendingChangesBanner/>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    marginTop: 0,
    flex: 1
  }
});