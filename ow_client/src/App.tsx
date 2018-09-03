/**
 * Main OurWater App
 * 
 */
import * as React from 'react'; import { Component } from 'react';
import {
  BackHandler,
  ScrollView,
  Text,
  View,
} from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import firebase from 'react-native-firebase';

import LoadLocationButton from './components/LoadLocationButton';
import IconButton from './components/IconButton';
import Loading from './components/Loading';
import ResourceDetailSection from './components/ResourceDetailSection';
import PendingChangesBanner from './components/PendingChangesBanner';
import { Location } from './typings/Location';

import * as myPinImg from './assets/my_pin.png';

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

import Config from 'react-native-config';
import { bgLight, bgMed, textDark, textLight, primaryDark } from './utils/Colors';
import ClusteredMapView from './components/common/ClusteredMapView';
import FavouriteResourceList from './components/FavouriteResourceList';
import { SearchBar, Icon } from 'react-native-elements';
import BaseApi from './api/BaseApi';
import { ConfigFactory } from './config/ConfigFactory';
import { Resource, BasicCoords } from './typings/models/OurWater';
import { isNullOrUndefined } from 'util';
import { NetworkStatusBanner } from './components/NetworkStatusBanner';
import MapSection, { MapRegion } from './components/MapSection';

const orgId = Config.REACT_APP_ORG_ID;

export interface Props {
  navigator: any;
  config: ConfigFactory,
}

export interface State {
  loading: boolean;
  region: MapRegion,
  userRegion: MapRegion,
  mapHeight: MapHeightOption,
  mapState: MapStateOption,
  hasSelectedResource: boolean,
  selectedResource?: Resource,
  isSearching: boolean,
  isAuthenticated: boolean,
  userId: string,
  resources: any[],
}

export default class App extends Component<Props> {
  mapRef?: MapView;
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
    mapHeight: MapHeightOption.default,
    mapState: MapStateOption.default,
    hasSelectedResource: false,
    isSearching: false,
    isAuthenticated: false,
    userId: '',
    resources: []
  };

  fs: any;
  hardwareBackListener: any;
  appApi: BaseApi;

  constructor(props: Props) {
    super(props);

    this.fs = firebase.firestore();
    this.appApi = props.config.getAppApi();

    //Listen to events from the navigator
    this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
  }

  componentWillMount() {
    this.hardwareBackListener = BackHandler.addEventListener('hardwareBackPress', () => this.hardwareBackPressed());
    this.setState({loading: true});

    this.appApi.silentSignin()
    .then(siginData => {
      console.log("signed in");
      this.setState({
        isAuthenticated: true,
        userId: siginData.user.uid,
        loading: false, //we are still loading stuff, but each component can take care of itself
      });
      return getLocation();
    })
    .catch(err => {
      console.log('error signing in', err);
      this.setState({ isAuthenticated: false });
      return getLocation();
    })
    .then(location => {
      this.updateGeoLocation(location);

      //Either load all the resources, or just those close to user's pin
      if (this.props.config.getShouldMapLoadAllResources()) {
        return this.appApi.getResources();
      }

      return this.appApi.getResourceNearLocation(location.coords.latitude, location.coords.longitude, 0.1);
    })
    .then(resources => {
      this.setState({
        resources,
      });
    })
    .catch(err => {
      console.log(err);
    });
  }

  componentWillUnmount() {
    //TODO unsubscribe if possible?
    // this.hardwareBackListener
  }

  /*--- externally bound events ---*/

  hardwareBackPressed() {
    if (this.state.hasSelectedResource) {
      this.clearSelectedResource();
      return true;
    }

    return false;
  }

  onNavigatorEvent(event: any) {
    if (event.id === 'search') {
      console.log("Search pressed");
      navigateTo(this.props, 'screen.SearchScreen', 'Search', {
        config: this.props.config, 
        userId: this.state.userId
      });
    }
  }

  /**
   * The user has dragged the map in the MapSection.
   * Load new resources based on where they are looking
   */
  onMapRegionChange(region: Region) {
    // return this.reloadResourcesIfNeeded(region)
  }

  /**
   * Only reload the resources if the api can support it
   * otherwise it's a lot of work!
   */
  reloadResourcesIfNeeded(region: Region) {
    if (this.props.config.getShouldMapLoadAllResources()) {
      //Resources are all already loaded.
      return;
    }

    //TODO: scale the distance with the latitude and longitude deltas
    return this.appApi.getResourceNearLocation(region.latitude, region.longitude, 0.1)
      .then(resources => {
        this.setState({
          loading: false,
          resources,
        });
      })
      .catch(err => {
        console.log(err);
      });
  }

  /**
   * When user clicks on a resource, make the map small, 
   * scroll to the top of the view, and display the resource details
   * 
   * @param {*} param0 
   */
  focusResource(coordinate: BasicCoords) {
    const resource = getSelectedResourceFromCoords(this.state.resources, coordinate);
    if (isNullOrUndefined(resource)) {
      console.warn("tried to call focusResource, but resource was null");
      return;
    }

    this.selectResource(resource);
  }

  selectResource(resource: Resource) {
    this.setState({
      // mapHeight: MapHeightOption.small,
      // mapState: MapStateOption.small,
      hasSelectedResource: true,
      selectedResource: resource,
    });

    //Do in the background - we don't care when
    //TODO: replace with otherApi
    this.appApi.addRecentResource(resource, this.state.userId);
  }

  updateGeoLocation(location: Location) {
    console.log("update GeoLocation");

    let region = {...this.state.region};

    
    //Move the pin to the user's location, 
    //and move the map back to where the user is
    //TODO: chang the zoom level?
    region.latitude = location.coords.latitude;
    region.longitude = location.coords.longitude;

    // console.log("updating geolocation", region, userRegion);

    if (this.mapRef) {
      console.log('animating underlying map!',location);
      this.mapRef.animateToCoordinate({
        latitude: region.latitude,
        longitude: region.longitude,
      }, 1000);
      
    } else {
      console.log("tried to animate map, but map is null");
    }
    
    this.setState({
      region,
    });
  }

  //TODO: not sure how to handle this with the nested map...
  clearSelectedResource() {
    this.setState({
      mapState: MapStateOption.default,
      mapHeight:MapHeightOption.default,
      hasSelectedResource: false,
      selectedResource: null,
    });
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


  getResourceView() {
    const {hasSelectedResource, selectedResource, userId} = this.state;

    if (!hasSelectedResource || isNullOrUndefined(selectedResource)) {
      return null;
    }

    console.log('selectedResource is', selectedResource);

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
        <MapSection 
          mapRef={(ref: any) => {this.mapRef = ref}}
          initialRegion={this.state.region}
          resources={this.state.resources}
          userRegion={this.state.userRegion}
          onMapRegionChange={(l: Region) => this.onMapRegionChange(l)}
          onResourceSelected={(r: Resource) => this.selectResource(r)}
          onGetUserLocation={(l: Location) => this.updateGeoLocation(l)}
          selectedResource={this.state.selectedResource}
          hasSelectedResource={this.state.hasSelectedResource}
          // mapState={this.state.mapState}
          // mapHeight={this.state.mapHeight}
        />
        <ScrollView style={{
            marginTop: 0,
            flex: 1
          }}
        >
          {this.getResourceView()}
          {this.getFavouritesList()}
        </ScrollView>
        <PendingChangesBanner/>
        {/* <NetworkStatusBanner config={this.props.config}/> */}
      </View>
    );
  }
}