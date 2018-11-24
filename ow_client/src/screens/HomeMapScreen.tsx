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
  ToastAndroid,
} from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import Loading from '../components/common/Loading';
import ResourceDetailSection from '../components/ResourceDetailSection';
import { Location, LocationType } from '../typings/Location';
import {
  navigateTo,
  showModal,
  maybeLog,
} from '../utils';
import {
  MapStateOption,
  MapHeightOption,
} from '../enums';
import { bgLight, primaryDark, primary, primaryLight } from '../utils/Colors';
import FavouriteResourceList from '../components/FavouriteResourceList';
import BaseApi from '../api/BaseApi';
import { ConfigFactory } from '../config/ConfigFactory';
import { isNullOrUndefined } from 'util';
import MapSection, { MapRegion } from '../components/MapSection';
import PendingChangesBanner from '../components/PendingChangesBanner';
import { SyncStatus } from '../typings/enums';

import { connect } from 'react-redux'
import { AppState } from '../reducers';
import NetworkStatusBanner from '../components/NetworkStatusBanner';
import * as appActions from '../actions/index';
import { UserType } from '../typings/UserTypes';
import { ActionMeta, SyncMeta } from '../typings/Reducer';
import { ResultType, SomeResult } from '../typings/AppProviderTypes';
import { TranslationFile } from 'ow_translations';
import { SearchButtonPressedEvent } from '../utils/Events';
//@ts-ignore
import EventEmitter from "react-native-eventemitter";
import PassiveLoadingIndicator from '../components/common/PassiveLoadingIndicator';
import { AnyResource } from '../typings/models/Resource';
import PendingResourceDetailSection from '../components/PendingResourceDetailSection';
import { PendingResource } from '../typings/models/PendingResource';
import { OrgType } from '../typings/models/OrgType';

export interface OwnProps {
  navigator: any;
  config: ConfigFactory,
  appApi: BaseApi,
}

export interface StateProps {
  userId: string,
  userIdMeta: ActionMeta,
  location: Location,
  locationMeta: SyncMeta,
  resources: AnyResource[],
  pendingResources: PendingResource[],
  resourcesMeta: SyncMeta,
  translation: TranslationFile
}

export interface ActionProps {
  addRecent: any,
  loadResourcesForRegion: (api: BaseApi, userId: string, region: Region) => SomeResult<void>,
}

export interface State {
  initialRegion?: MapRegion,
  mapHeight: MapHeightOption,
  mapState: MapStateOption,
  hasSelectedResource: boolean,
  selectedResource?: AnyResource | PendingResource,
  isSearching: boolean,
  isAuthenticated: boolean,
}

class HomeMapScreen extends Component<OwnProps & StateProps & ActionProps> {
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
      latitudeDelta: 3.0,
      longitudeDelta: 3.0,
    },
  };

  hardwareBackListener: any;
  appApi: BaseApi;

  constructor(props: OwnProps & StateProps & ActionProps) {
    super(props);


    //@ts-ignore
    this.appApi = props.config.getAppApi();

    //Listen to events from the navigator
    // this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
    EventEmitter.addListener(SearchButtonPressedEvent, this.onNavigatorEvent.bind(this));
  }

  componentWillMount() {
    console.log("App componentWillMount");

    this.hardwareBackListener = BackHandler.addEventListener('hardwareBackPress', () => this.hardwareBackPressed());
  }

  componentDidMount() {
    console.log("App componentDidMount");
  }

  componentWillReceiveProps() {
    console.log("App componentWillReceiveProps");
  }

  componentWillUnmount() {
    //TODO unsubscribe if possible?
    // this.hardwareBackListener
    EventEmitter.removeAllListeners(SearchButtonPressedEvent);
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
    const { translation: { templates: { search_heading } } } = this.props;

    if (event === 'SEARCH') {
      navigateTo(this.props, 'screen.SearchScreen', search_heading, {
        config: this.props.config,
        userId: this.props.userId,
        // TODO: AnyResource needs to be something else
        onSearchResultPressed: (result: AnyResource) => this.onSearchResultPressed(result),
      });
    }
  }

  /**
   * The user has dragged the map in the MapSection.
   * Load new resources based on where they are looking
   */
  async onMapRegionChange(region: Region) {
    const { translation: { templates: { app_resource_load_error } } } = this.props;

    const result = await this.props.loadResourcesForRegion(this.appApi, this.props.userId, region);

    if (result.type === ResultType.ERROR) {
      ToastAndroid.showWithGravity(app_resource_load_error, ToastAndroid.SHORT, ToastAndroid.TOP);
    }
  }

  onBannerPressed(bannerState: SyncStatus) {
    const { translation: { templates: { settings_sync_heading } } } = this.props;

    //TODO: adapt for other environments!
    if (bannerState === SyncStatus.pendingGGMNLogin) {
      //Redirect user to settings view
      showModal(
        this.props,
        'screen.menu.ConnectToServiceScreen',
        settings_sync_heading,
        {
          config: this.props.config,
          userId: this.props.userId,
          isConnected: false, //This is an assumption, we should probably check again...
        }
      );
    }

    if (bannerState === SyncStatus.pendingGGMNWrites) {
      showModal(
        this.props,
        'screen.menu.SyncScreen',
        settings_sync_heading,
        {
          config: this.props.config,
          userId: this.props.userId,
        }
      );
    }

    if (bannerState === SyncStatus.ggmnError) {

    }
  }

  /**
   * Handle when a user clicks a result from the search screen.
   * 
   */
  async onSearchResultPressed(r: AnyResource): Promise<void> {
    const { translation: { templates: { app_resource_not_found } } } = this.props;
    //TODO: reimmplement selectResource for a search entity.
    //Load the resource for the search entity?

    //TODO: get the description
    console.log("onSearchResultPressed", r);
    // const description = 

    //We can move the user there on the map before the resource has loaded...
    //TODO: Refactor, this is getting really messy.
    let result: SomeResult<AnyResource> | null = null;
    if (r.type === OrgType.GGMN) {
      //TODO: This is a hack because the GGMN api is broken - need to fix this properly
      result = await this.appApi.getResourceFromSearchDescription(this.props.userId, r.description, r.title);
      if (result.type === ResultType.ERROR) {
        //Try using old method
        result = await this.appApi.deprecated_getResourceFromSearchEntityId(this.props.userId, r.id);
      }

    } else {
      result = await this.appApi.deprecated_getResourceFromSearchEntityId(this.props.userId, r.id)
    }

    if (result.type === ResultType.ERROR) {
      ToastAndroid.show(app_resource_not_found, ToastAndroid.SHORT);
      return;
    }
    const resource = result.result;
    //TODO: move elsewhere
    const resourceLocation: Location = {
      type: LocationType.LOCATION,
      coords: {
        latitude: resource.coords._latitude,
        longitude: resource.coords._longitude,
      }
    };
    this.updateGeoLocation(resourceLocation);
    this.selectResource(result.result);
  }

  selectResource(resource: AnyResource | PendingResource) {
    this.setState({
      hasSelectedResource: true,
      selectedResource: resource,
    });

    //TECH DEBT
    //Only add full resources to the recent list:
    if (!resource.pending) {
      this.props.addRecent(this.appApi, this.props.userId, resource);
    }
  }

  updateGeoLocation(location: Location) {
    if (this.mapRef) {
      this.mapRef.animateToCoordinate({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      }, 1000);

    } else {
      maybeLog("tried to animate map, but map is null");
    }
  }

  clearSelectedResource() {
    this.setState({
      hasSelectedResource: false,
      selectedResource: null,
    });
  }

  getPassiveLoadingIndicator() {
    const { resourcesMeta: { loading } } = this.props;

    if (!loading) {
      return null;
    }

    return <PassiveLoadingIndicator/>
  }

  getFavouritesList() {
    const { hasSelectedResource } = this.state;

    //Hide when we are looking at a resource
    if (hasSelectedResource) {
      return null;
    }

    return (
      <FavouriteResourceList
        config={this.props.config}
        userId={this.props.userId}
        onResourceCellPressed={(r: AnyResource) => this.selectResource(r)}
      />
    );
  }

  getResourceView() {
    const { hasSelectedResource, selectedResource } = this.state;
    const { userId, translation: { templates: { resource_detail_new } } } = this.props;

    if (!hasSelectedResource || isNullOrUndefined(selectedResource)) {
      return null;
    }

    if (selectedResource.pending) {
      return <PendingResourceDetailSection
        hideTopBar={false}
        config={this.props.config}
        userId={userId}
        pendingResource={selectedResource}
        onAddReadingPressed={(resource: AnyResource | PendingResource) => {
          navigateTo(this.props, 'screen.NewReadingScreen', resource_detail_new, {
            resource,
            config: this.props.config,
            userId: this.props.userId
          });
        }}
      />
    }

    return (
      <ResourceDetailSection
        hideTopBar={false}
        config={this.props.config}
        userId={userId}
        resource={selectedResource}
        onAddReadingPressed={(resource: AnyResource | PendingResource) => {
          navigateTo(this.props, 'screen.NewReadingScreen', resource_detail_new, {
            resource,
            config: this.props.config,
            userId: this.props.userId
          });
        }}
      />
    );
  }

  render() {
    const { initialRegion, mapState } = this.state;
    const { userIdMeta: { loading } } = this.props;

    if (loading) {
      return (
        <View style={{
          justifyContent: 'center',
          alignItems: 'center',
          flex: 1,
          backgroundColor: bgLight,
        }}>
          <Loading />
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
        flexDirection: 'column',
      }}>
        {this.getPassiveLoadingIndicator()}
        {isNullOrUndefined(initialRegion) ? null :
          <MapSection
            mapRef={(ref: any) => { this.mapRef = ref }}
            initialRegion={initialRegion}
            resources={this.props.resources}
            pendingResources={this.props.pendingResources}
            onMapRegionChange={(l: Region) => this.onMapRegionChange(l)}
            onResourceSelected={(r: PendingResource | AnyResource) => this.selectResource(r)}
            onResourceDeselected={() => this.clearSelectedResource()}
            onGetUserLocation={(l: Location) => this.updateGeoLocation(l)}
            onMapStateChanged={(m: MapStateOption) => this.setState({ mapState: m })}
            selectedResource={this.state.selectedResource}
            hasSelectedResource={this.state.hasSelectedResource}
            shouldShrinkForSelectedResource={true}
            shouldDisplayFullSceenButton={true}
            shouldShowCallout={false}
          />}
        {mapState === MapStateOption.fullscreen ? null :
          <ScrollView
            style={{
              flex: 1,
              backgroundColor: 'red',
            }}
            contentContainerStyle={{ flexGrow: 1 }}
          >
            {this.getResourceView()}
            {this.getFavouritesList()}
          </ScrollView>
        }
        <PendingChangesBanner onBannerPressed={(bannerState: SyncStatus) => this.onBannerPressed(bannerState)} />
        <NetworkStatusBanner />
      </View>
    );
  }
}

//If we don't have a user id, we should load a different app I think.
const mapStateToProps = (state: AppState, ownProps: OwnProps): StateProps => {
  let userId = ''; //I don't know if this fixes the problem...

  //Default location
  let location: Location = { type: LocationType.LOCATION, coords: { latitude: -20.4010, longitude: 32.3373 } };
  if (state.user.type === UserType.USER) {
    userId = state.user.userId;
  }

  if (state.location.type !== LocationType.NO_LOCATION) {
    location = state.location;
  }

  return {
    userId,
    userIdMeta: state.userIdMeta,
    location,
    locationMeta: state.locationMeta,
    resources: state.resources,
    pendingResources: state.pendingSavedResources,
    resourcesMeta: state.resourcesMeta,
    translation: state.translation,
  }
}

const mapDispatchToProps = (dispatch: any): ActionProps => {
  return {
    addRecent: (api: BaseApi, userId: string, resource: AnyResource) => {
      dispatch(appActions.addRecent(api, userId, resource))
    },
    loadResourcesForRegion: (api: BaseApi, userId: string, region: Region) =>
      dispatch(appActions.getResources(api, userId, region)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(HomeMapScreen);