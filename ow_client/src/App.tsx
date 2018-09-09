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
  ProgressBarAndroid,
} from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import firebase from 'react-native-firebase';

import LoadLocationButton from './components/LoadLocationButton';
import IconButton from './components/IconButton';
import Loading from './components/Loading';
import ResourceDetailSection from './components/ResourceDetailSection';
import { Location } from './typings/Location';

import * as myPinImg from './assets/my_pin.png';

import { 
  getLocation,
  getSelectedResourceFromCoords,
  navigateTo,
  getShortId,
  formatCoords,
  showModal,
} from './utils';

import {
  MapStateOption,
  ResourceType,
  MapHeightOption,
} from './enums';

import Config from 'react-native-config';
import { bgLight, bgMed, textDark, textLight, primaryDark, bgLightHighlight, primaryLight } from './utils/Colors';
import ClusteredMapView from './components/common/ClusteredMapView';
import FavouriteResourceList from './components/FavouriteResourceList';
import { SearchBar, Icon } from 'react-native-elements';
import BaseApi from './api/BaseApi';
import { ConfigFactory } from './config/ConfigFactory';
import { Resource, BasicCoords } from './typings/models/OurWater';
import { isNullOrUndefined } from 'util';
import NetworkStatusBannerFactory from './components/NetworkStatusBanner';
import MapSection, { MapRegion } from './components/MapSection';
import PendingChangesBannerWithContext from './components/PendingChangesBanner';
import AppProvider, { AppContext } from './AppProvider';
import { SyncStatus } from './typings/enums';
import NetworkStatusBannerWithContext from './components/NetworkStatusBanner';

const orgId = Config.REACT_APP_ORG_ID;

export interface Props {
  navigator: any;
  config: ConfigFactory,

  appApi: BaseApi, //injected by provider I think.
}

export interface State {
  loading: boolean;
  passiveLoading: boolean; //Use for a load that doesn't need to stop user from interacting
  initialRegion?: MapRegion,
  mapHeight: MapHeightOption,
  mapState: MapStateOption,
  hasSelectedResource: boolean,
  selectedResource?: Resource,
  isSearching: boolean,
  isAuthenticated: boolean,
  userId: string,
  resources: any[],
}

// export default function AppFactory(myConfig: ConfigFactory) {
//   //Init other components with DI:
//   const PendingChangesBanner = PendingChangesBannerFactory(myConfig);
//   const NetworkStatusBanner = NetworkStatusBannerFactory(myConfig);

export class App extends Component<Props> {
    mapRef?: MapView;
    state: State = {
      loading: true,
      passiveLoading: false,
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

      console.log("this.props.appApi", props.appApi)

      this.fs = firebase.firestore();
      this.appApi = props.config.getAppApi();
      // this.appApi = myConfig.getAppApi();
      // console.log("myConfig is:", myConfig)

      //Listen to events from the navigator
      this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
    }

    componentWillMount() {
      let location: Location;

      this.hardwareBackListener = BackHandler.addEventListener('hardwareBackPress', () => this.hardwareBackPressed());
      this.setState({loading: true, passiveLoading: true});

      this.appApi.silentSignin()
      .then(siginData => {
        this.setState({
          isAuthenticated: true,
          userId: siginData.user.uid,
          loading: false, //we are still loading stuff, but each component can take care of itself
        });
        return getLocation();
      })
      .catch(err => {
        this.setState({ isAuthenticated: false });
        return getLocation();
      })
      .then(_location => {
        location = _location;
        const initialRegion: Region = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.5,
          longitudeDelta: 0.5,
        };

        this.setState({initialRegion});

        //Either load all the resources, or just those close to user's pin
        if (this.props.config.getShouldMapLoadAllResources()) {
          return this.appApi.getResources();
        }

        return this.appApi.getResourcesWithinRegion(initialRegion);
      })
      .then(resources => {
        this.setState({
          resources,
          passiveLoading: false,
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
      return this.reloadResourcesIfNeeded(region)
    }

    onBannerPressed(bannerState: SyncStatus) {
      if (bannerState === SyncStatus.pendingGGMNLogin) {
        //Redirect user to settings view
        showModal(
          this.props,
          'screen.menu.ConnectToServiceScreen',
          this.props.config.getConnectToButtonText(),
          {
            config: this.props.config,
            userId: this.state.userId,
            isConnected: false, //This is an assumption, we should probably check again...
          }
        );
      }

      //TODO: this one is tricky. If they don't have permission
      //To save to a resource, then we need to allow the user to
      //delete pending readings and stuff, which means we need to
      //display a list of the pending readings with a state next to them
      //I'll leave this now until I can think of an easier option
      if (bannerState === SyncStatus.ggmnError) {

      }
    }

    /**
     * Only reload the resources if the api can support it
     * otherwise it's a lot of work!
     */
    reloadResourcesIfNeeded(region: Region): Promise<any> {
      //TODO: be smarter about how we determine whether or not to reload resources.

      if (this.props.config.getShouldMapLoadAllResources()) {
        //Resources are all already loaded.
        return Promise.resolve(true);
      }

      this.setState({passiveLoading: true});

      //TODO: scale the distance with the latitude and longitude deltas
      return this.appApi.getResourcesWithinRegion(region)
        .then(resources => {
          this.setState({
            loading: false,
            passiveLoading: false,
            resources,
          });
        })
        .catch(err => {
          console.log(err);
          this.setState({
            loading: false,
            passiveLoading: false,
          });
        });
    }

    selectResource(resource: Resource) {
      this.setState({
        hasSelectedResource: true,
        selectedResource: resource,
      });

      this.appApi.addRecentResource(resource, this.state.userId);
    }

    updateGeoLocation(location: Location) {
      if (this.mapRef) {
        this.mapRef.animateToCoordinate({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        }, 1000);
        
      } else {
        console.log("tried to animate map, but map is null");
      }
    }

    clearSelectedResource() {
      this.setState({
        hasSelectedResource: false,
        selectedResource: null,
      });
    }

    getPassiveLoadingIndicator() {
      const { passiveLoading } = this.state;

      if (!passiveLoading) {
        return null;
      }

      return (
        <ProgressBarAndroid
          styleAttr="Horizontal"
          indeterminate={true}
          color={primaryDark}
          style={{
            marginVertical: -6, //make it just touch the bottom
          }}
        />
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
          onResourceCellPressed={(r: Resource) => this.selectResource(r)}
        />
      );
    }


    getResourceView() {
      const {hasSelectedResource, selectedResource, userId} = this.state;

      if (!hasSelectedResource || isNullOrUndefined(selectedResource)) {
        return null;
      }

      return (
        <View style={{
          backgroundColor: bgLight,
        }}>
          <ResourceDetailSection
            config={this.props.config}
            userId={userId}
            resource={selectedResource}
            onMorePressed={(resource: Resource) => {
              navigateTo(this.props, 'screen.ResourceDetailScreen', 'Details', {
                legacyId: resource.legacyId,
                config: this.props.config,
                userId: this.state.userId,
              });
            }}
            onAddToFavourites={() => console.log('onAddToFavourites')}
            onRemoveFromFavourites={() => console.log('onRemoveFromFavourites')}
            onAddReadingPressed={(resource: Resource) => {
              navigateTo(this.props, 'screen.NewReadingScreen', 'New Reading', {
                resource, 
                config: this.props.config,
                userId: this.state.userId
              });
            }} 
          />
        </View>
      );
    }
    
    render() {
      const { loading, initialRegion } = this.state;

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

      if (!initialRegion) {
        return null;
      }

      return (
        <View style={{
          marginTop: 0,
          flex: 1,
          backgroundColor: bgLight,
        }}>
        {isNullOrUndefined(initialRegion) ? null :
          <MapSection 
            mapRef={(ref: any) => {this.mapRef = ref}}
            initialRegion={initialRegion}
            resources={this.state.resources}
            onMapRegionChange={(l: Region) => this.onMapRegionChange(l)}
            onResourceSelected={(r: Resource) => this.selectResource(r)}
            onResourceDeselected={() => this.clearSelectedResource()}
            onGetUserLocation={(l: Location) => this.updateGeoLocation(l)}
            selectedResource={this.state.selectedResource}
            hasSelectedResource={this.state.hasSelectedResource}
          />}
          <ScrollView style={{
              marginTop: 0,
              flex: 1
            }}
          >
            {this.getResourceView()}
            {this.getFavouritesList()}
          </ScrollView>
          {this.getPassiveLoadingIndicator()}
          <PendingChangesBannerWithContext
            config={this.props.config}
            userId={this.state.userId}
            onBannerPressed={(bannerState: SyncStatus) => this.onBannerPressed(bannerState)}
          />
          <NetworkStatusBannerWithContext/>
        </View>
      );
    }
  }

const AppWithProvider = (props: Props) => {
  return (
    <AppProvider config={props.config}>
      <AppContext.Consumer>
        {({appApi}) => (
          <App
            appApi={appApi}
            {...props}
          />
        )}
      </AppContext.Consumer>
    </AppProvider>
  );
}

export default AppWithProvider;