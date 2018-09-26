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
import Loading from './components/common/Loading';
import ResourceDetailSection from './components/ResourceDetailSection';
import { Location } from './typings/Location';
import { 
  getLocation,
  navigateTo,
  showModal,
} from './utils';

import {
  MapStateOption,
  ResourceType,
  MapHeightOption,
} from './enums';
import Config from 'react-native-config';
import { bgLight, primaryDark } from './utils/Colors';
import FavouriteResourceList from './components/FavouriteResourceList';
import BaseApi from './api/BaseApi';
import { ConfigFactory } from './config/ConfigFactory';
import { Resource, BasicCoords } from './typings/models/OurWater';
import { isNullOrUndefined } from 'util';
import MapSection, { MapRegion } from './components/MapSection';
import PendingChangesBanner from './components/PendingChangesBanner';
import  { AppContext, ActionMeta, SyncMeta } from './AppProvider';
import { SyncStatus } from './typings/enums';

import { connect } from 'react-redux'
import NetworkStatusBanner from './components/NetworkStatusBanner';
import { AppState } from './reducers';
import * as appActions from './actions/index';
import { UserType } from './typings/UserTypes';


export interface Props {
  userId: string, 
  userIdMeta: ActionMeta,

  navigator: any;
  config: ConfigFactory,


  //Injected by connect function
  addRecent: any,
  location: Location,
  locationMeta: SyncMeta,
  resources: Resource[],
  resourcesMeta: SyncMeta,
  getGeolocation: any,


  //TODO: update
  appApi: BaseApi, 
}

export interface State {
  initialRegion?: MapRegion,
  mapHeight: MapHeightOption,
  mapState: MapStateOption,
  hasSelectedResource: boolean,
  selectedResource?: Resource,
  isSearching: boolean,
  isAuthenticated: boolean,
}

class App extends Component<Props> {
    mapRef?: MapView;
    state: State = {
      mapHeight: MapHeightOption.default,
      mapState: MapStateOption.default,
      hasSelectedResource: false,
      isSearching: false,
      isAuthenticated: false,
      initialRegion: {
        latitude: this.props.location.coords.latitude,
        longitude: this.props.location.coords.longitude,
        latitudeDelta: 0.5,
        longitudeDelta: 0.5,
      },
    };

    hardwareBackListener: any;
    appApi: BaseApi;

    constructor(props: Props) {
      super(props);

      //@ts-ignore
      this.appApi = props.config.getAppApi();

      //Listen to events from the navigator
      this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
    }

    componentWillMount() {
      this.hardwareBackListener = BackHandler.addEventListener('hardwareBackPress', () => this.hardwareBackPressed());
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
          onSearchResultPressed: (result: any) => this.onSearchResultPressed(result),
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
            userId: this.props.userId,
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
     * Handle when a user clicks a result from the search screen.
     * 
     */
    onSearchResultPressed(r: Resource): void {
      this.selectResource(r);
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

      this.props.addRecent(this.appApi, this.props.userId, resource);
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
      //TODO: determine based on the resourceMeta
      const { resourcesMeta: {loading} } = this.props;

      if (!loading) {
        return null;
      }

      return (
        <ProgressBarAndroid
          styleAttr="Horizontal"
          indeterminate={true}
          color={primaryDark}
          style={{
            marginVertical: -6,
            position: 'absolute',
            zIndex: 10,
            top: 0,
            left: 0,
            right: 0, 
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
          userId={this.props.userId}
          onResourceCellPressed={(r: Resource) => this.selectResource(r)}
        />
      );
    }


    getResourceView() {
      const {hasSelectedResource, selectedResource } = this.state;
      const {userId} = this.props;

      if (!hasSelectedResource || isNullOrUndefined(selectedResource)) {
        return null;
      }

      console.log('getResourceView, selectedResource', selectedResource);

      return (
        <ResourceDetailSection
          config={this.props.config}
          userId={userId}
          resource={selectedResource}
          onMorePressed={(resource: Resource) => {
            navigateTo(this.props, 'screen.ResourceDetailScreen', 'Details', {
              legacyId: resource.legacyId,
              config: this.props.config,
              userId: this.props.userId,
            });
          }}
          onAddToFavourites={() => console.log('onAddToFavourites')}
          onRemoveFromFavourites={() => console.log('onRemoveFromFavourites')}
          onAddReadingPressed={(resource: Resource) => {
            navigateTo(this.props, 'screen.NewReadingScreen', 'New Reading', {
              resource, 
              config: this.props.config,
              userId: this.props.userId
            });
          }} 
        />
      );
    }
    
    render() {
      const { initialRegion } = this.state;
      const { userIdMeta: { loading } } = this.props;

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
        {this.getPassiveLoadingIndicator()}
        {isNullOrUndefined(initialRegion) ? null :
          <MapSection 
            mapRef={(ref: any) => {this.mapRef = ref}}
            initialRegion={initialRegion}
            resources={this.props.resources}
            onMapRegionChange={(l: Region) => this.onMapRegionChange(l)}
            onResourceSelected={(r: Resource) => this.selectResource(r)}
            onResourceDeselected={() => this.clearSelectedResource()}
            onGetUserLocation={(l: Location) => this.updateGeoLocation(l)}
            selectedResource={this.state.selectedResource}
            hasSelectedResource={this.state.hasSelectedResource}
          />}
          <ScrollView 
            style={{
              marginTop: 0,
              flex: 1
            }}
            contentContainerStyle={{ flexGrow: 1 }}
          >
            {this.getResourceView()}
            {this.getFavouritesList()}
          </ScrollView>
          <PendingChangesBanner
            onBannerPressed={(bannerState: SyncStatus) => this.onBannerPressed(bannerState)}
          />
          {/* Not sure how to fix this... */}
          <NetworkStatusBanner/>
        </View>
      );
    }
  }

//If we don't have a user id, we should load a different app I think.
const mapStateToProps = (state: AppState) => {
  let userId = ''; //I don't know if this fixes the problem...

  if (state.user.type === UserType.USER) {
    userId = state.user.userId;
  }

  return {
    userId,
    userIdMeta: state.userIdMeta,
    location: state.location,
    locationMeta: state.locationMeta,
    resources: state.resources,
    resourcesMeta: state.resourcesMeta,
  }
}

const mapDispatchToProps = (dispatch: any) => {
  return {
    addRecent: (api: BaseApi, userId: string, resource: Resource) => {
      dispatch(appActions.addRecent(api, userId, resource))
    },
  }
}


export default connect(mapStateToProps, mapDispatchToProps)(App);