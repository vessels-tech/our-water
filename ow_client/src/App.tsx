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
import { Marker } from 'react-native-maps';
import firebase, { RNFirebase } from 'react-native-firebase';

import LoadLocationButton from './components/LoadLocationButton';
import IconButton from './components/IconButton';
import Loading from './components/Loading';
import ResourceDetailSection from './components/ResourceDetailSection';
import PendingChangesBanner from './components/PendingChangesBanner';
import { Location } from './typings/Location';


import FirebaseApi from './api/FirebaseApi';
import { 
  getLocation,
  getSelectedResourceFromCoords,
  navigateTo,
  getShortId,
  formatCoords,
} from './utils';

import {
  MapStateOption,
  ResourceType,
  MapHeightOption,
} from './enums';

import Config from 'react-native-config'
import NetworkApi from './api/NetworkApi';
import { bgLight, primary, bgDark, bgMed, bgDark2, textDark, textLight, primaryDark } from './utils/Colors';
import ClusteredMapView from './components/common/ClusteredMapView';
import { Resource } from './typings/Resource';
import FavouriteResourceList from './components/FavouriteResourceList';
import { SearchBar, Icon } from 'react-native-elements';

const orgId = Config.REACT_APP_ORG_ID;

export interface Props {
  navigator: any,
};

export interface State {
  loading: boolean,
  region: {
    latitude: number,
    longitude: number,
    latitudeDelta: number,
    longitudeDelta: number,
  },
  userRegion: {
    latitude: number,
    longitude: number,
    latitudeDelta: number,
    longitudeDelta: number,
  },
  droppedPin: boolean,
  droppedPinCoords: any,
  hasSavedReadings: boolean,
  mapHeight: any,
  mapState: MapStateOption,
  hasSelectedResource: boolean,
  selectedResource: any,
  isSearching: boolean,
  isAuthenticated: boolean,
  userId: string,
  resources: any[],
};


export default class App extends Component<Props> {
  state: State = {
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
    mapHeight: MapHeightOption.default,
    mapState: MapStateOption.default,
    hasSelectedResource: false,
    selectedResource: {},
    isSearching: false,
    isAuthenticated: false,
    userId: '',
    resources: []
  };

  fs: any;
  networkApi: NetworkApi;
  hardwareBackListener: any;


  constructor(props: Props) {
    super(props);
    this.fs = firebase.firestore();
    this.networkApi = new NetworkApi();    
  }

  componentWillMount() {
    let { region } = this.state;
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
      //TODO: can't do ths from GGMN
      return FirebaseApi.getResourceNearLocation(this.networkApi, {orgId, ...location.coords, distance: 0.1});
    })
    .then(resources => {
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

  //Change to when the map is moved
  onMapPressed(coordinate: any) {
    const { mapState } = this.state;

    //Don't drop a marker if the map is in small mode, 
    //just make the map bigger, and deselect the resource
    if (mapState === MapStateOption.small) {
      this.setState({
        mapState: MapStateOption.default,
        mapHeight: MapHeightOption.default,
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
    //TODO: can't do this from GGMN
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

  //TODO: replace this with just the map view. When the map is moved, load the new markers
  getDroppedPin() {
    const { droppedPin, droppedPinCoords } = this.state;

    if (!droppedPin) {
      return null;
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

  onRegionChange(region: any) {
    this.setState({ region });
  }

  imageForResourceType(type: ResourceType) {
    switch (type) {
      case ResourceType.checkdam:
        return require('./assets/checkdam_pin.png');
      case ResourceType.raingauge:
        return require('./assets/raingauge_pin.png');
      case ResourceType.well:
        return require('./assets/well_pin.png');
      case ResourceType.custom:
        return require('./assets/other_pin.png')
    }
  }

  /**
   * When user clicks on a resource, make the map small, 
   * scroll to the top of the view, and display the resource details
   * 
   * @param {*} param0 
   */
  focusResource(coordinate: any) {
    const resource = getSelectedResourceFromCoords(this.state.resources, coordinate);
    this.selectResource(resource);
  }

  selectResource(resource: any) {
    this.setState({
      mapHeight: MapHeightOption.small,
      mapState: MapStateOption.small,
      hasSelectedResource: true,
      selectedResource: resource
    });

    //Do in the background - we don't care when
    FirebaseApi.addRecentResource(orgId, resource, this.state.userId);
  }

  getMap() {
    const { userRegion, region, resources, mapHeight } = this.state;

    return (
      <View style={{
        backgroundColor: bgMed,
      }}>
        <ClusteredMapView
          style={{
            position: 'relative',
            width: '100%',
            height: mapHeight
          }}
          clustering={true}
          clusterColor={primaryDark}
          clusterTextColor={textLight}
          clusterBorderColor={textLight}
          onClusterPress={(e: any) => this.onMapPressed(e.nativeEvent)}
          region={region}
          //@ts-ignore
          onRegionChangeComplete={(region: any) => this.onRegionChange(region)}
        >
        {/* TODO: enable these without the clustering */}
          <Marker
            key='geoLocation'
            coordinate={{ latitude: userRegion.latitude, longitude: userRegion.longitude}}
            title='Me'
            image={require('./assets/my_location.png')}
          />
          {this.getDroppedPin()}
          {/* TODO: Hide and show different groups at different levels */}
          {/* Pincode */}
          {/* Villages */}
          {resources.map(resource => {
              const shortId = getShortId(resource.id);
              return <Marker
                //@ts-ignore
                collapsable={true}
                key={shortId}
                coordinate={formatCoords(resource.coords)}
                title={`${shortId}`}
                description={resource.resourceType}
                image={this.imageForResourceType(resource.resourceType)}
                onPress={(e: any) => this.focusResource(e.nativeEvent)}
              />
            }
          )}
        </ClusteredMapView>
        <View style={{
          position: 'absolute',
          width: '100%',
          height: 40,
          bottom: '10%',
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
    if (mapState === MapStateOption.small) {
      return null;
    }

    return (
      <View style={{
        backgroundColor: bgLight,
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
          // navigateTo(this.props, 'screen.SettingsScreen', 'Settings', {});
          // console.log("opening drawer?", this.props.navigator);

          this.props.navigator.toggleDrawer({
            side: 'left', // the side of the drawer since you can have two, 'left' / 'right'
            animated: true, // does the toggle have transition animation or does it happen immediately (optional)
            to: 'open' // optional, 'open' = open the drawer, 'closed' = close it, missing = the opposite of current state
          });
        }}
        iconStyle={{
          color: textDark,
        }}
        underlayColor='transparent'
        containerStyle={{
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

  updateGeoLocation(location: Location) {
    let region = {...this.state.region};
    let userRegion = { ...this.state.userRegion};
    
    //Move the pin to the user's location, 
    //and move the map back to where the user is
    //TODO: chang the zoom level?
    region.latitude = location.coords.latitude;
    region.longitude = location.coords.longitude;
    userRegion.latitude = location.coords.latitude;
    userRegion.longitude = location.coords.longitude;

    // console.log("updating geolocation", region, userRegion);
    
    this.setState({
      region,
      userRegion,
    });
  }

  //Don't know if this will work...
  //TODO: figure out how to animate?
  toggleFullscreenMap() {
    const { mapState } = this.state;

    let newMapState = MapStateOption.default;
    let newMapHeight: any = MapHeightOption.default;
    
    if (mapState === MapStateOption.default) {
      newMapState = MapStateOption.fullscreen;
      newMapHeight = MapHeightOption.fullscreen;
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
      mapState: MapStateOption.default,
      mapHeight:MapHeightOption.default,
      hasSelectedResource: false,
      selectedResource: {},
    });
  }

  getMapButtons() {
    const { mapState, droppedPin } = this.state;

    //Hide these buttons when the map is in small mode
    if (mapState === MapStateOption.small) {
      //TODO: fade out nicely
      return null;
    }

    let fullscreenIcon = 'fullscreen';
    if (mapState === MapStateOption.fullscreen) {
      fullscreenIcon = 'fullscreen-exit';
    }

    return (
      <View style={{
        flexDirection:'row',
        justifyContent:'space-around',
      }}>
        <LoadLocationButton
          onComplete={(location: Location) => this.updateGeoLocation(location)}
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
    const { hasSelectedResource } = this.state;

    //Hide when we are looking at a resource
    if (hasSelectedResource) {
      return null;
    }

    return (  
      <FavouriteResourceList
        userId={this.state.userId}
        onResourceCellPressed={(resource: Resource) => {
          //TODO: move the map to select this resource
          this.selectResource(resource);
        }}
      />
    );
  }

  //A button for the user to deselect a resource, and exit out
  //of small map mode
  getUpButton() {
    const { hasSelectedResource } = this.state;

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
      }}>
        <ResourceDetailSection
          userId={userId}
          resource={selectedResource}
          onMorePressed={(resource: Resource) => {
            navigateTo(this.props, 'screen.ResourceDetailScreen', 'Details', {
              legacyId: resource.legacyId,
            });
          }}
          onAddToFavourites={() => console.log('onAddToFavourites')}
          onRemoveFromFavourites={() => console.log('onRemoveFromFavourites')}
          onAddReadingPressed={(resource: Resource) => {
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
    const { loading } = this.state;

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