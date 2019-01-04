import * as React from 'react'; import { Component } from 'react';
import {
  BackHandler,
  ScrollView,
  View,
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
import { bgLight } from '../utils/Colors';
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
import { PendingResource } from '../typings/models/PendingResource';
import { OrgType } from '../typings/models/OrgType';
import { diff } from 'deep-object-diff';


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
  loadingSearchResult: boolean,
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
    loadingSearchResult: false,
  };

  appApi: BaseApi;

  constructor(props: OwnProps & StateProps & ActionProps) {
    super(props);

    //@ts-ignore
    this.appApi = props.config.getAppApi();

    //Binds
    this.hardwareBackPressed = this.hardwareBackPressed.bind(this);

    //Listen to events from the navigator
    EventEmitter.addListener(SearchButtonPressedEvent, this.onNavigatorEvent.bind(this));
  }

  componentWillMount() {
    BackHandler.addEventListener('hardwareBackPress', this.hardwareBackPressed);
  }

  componentWillUnmount() {
    EventEmitter.removeAllListeners(SearchButtonPressedEvent);
    BackHandler.removeEventListener('hardwareBackPress', this.hardwareBackPressed);
  }

  componentWillReceiveProps(nextProps: OwnProps & StateProps & ActionProps) {
    //If a resource is selected, and it changes in the props, we need to update it.
    this.handleUpdatedResource(nextProps);
    this.handleUpdatedPendingResource(nextProps);
  }

  handleUpdatedResource(nextProps: OwnProps & StateProps & ActionProps) {
    const resourcesDiff: any = diff(this.props.resources, nextProps.resources);
    if (Object.keys(resourcesDiff).length > 0) {
      //Don't worry about updated the selected resource if there is none
      if (!this.state.hasSelectedResource || !this.state.selectedResource) {
        return;
      }

      const selectedResourceId = this.state.selectedResource.id;
      let updatedSelectedResource: AnyResource | null = null;
      nextProps.resources.forEach(r => {
        if (r.id === selectedResourceId) {
          updatedSelectedResource = r;
        }
      });

      if (!this.state.selectedResource.pending && !updatedSelectedResource) {
        this.setState({ selectedResource: null, hasSelectedResource: false });
        return;
      }

      this.setState({ seletedResource: updatedSelectedResource });
    }
  }

  handleUpdatedPendingResource(nextProps: OwnProps & StateProps & ActionProps) {
    const pendingResourcesDiff: any = diff(this.props.pendingResources, nextProps.pendingResources);

    if (Object.keys(pendingResourcesDiff).length > 0) {
      //Don't worry about updated the selected resource if there is none
      if (!this.state.hasSelectedResource || !this.state.selectedResource) {
        return;
      }

      const selectedResourceId = this.state.selectedResource.id;
      let updatedSelectedResource: PendingResource | null = null;
      nextProps.pendingResources.forEach(r => {
        if (r.id === selectedResourceId) {
          updatedSelectedResource = r;
        }
      });

      if (this.state.selectedResource.pending && !updatedSelectedResource) {
        this.setState({selectedResource: null, hasSelectedResource: false});
        return;
      }

      this.setState({ seletedResource: updatedSelectedResource });
    }
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
        onSearchResultPressed: (result: AnyResource) => this.onSearchResultPressedWithState(result),
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

  async onSearchResultPressedWithState(r: AnyResource) {

    this.setState({ loadingSearchResult: true }, async () => {
      //TD: use a global - we should be loading the resource not from this view
      await this.onSearchResultPressed(r);
      this.setState({ loadingSearchResult: false})
    });

  }

  /**
   * Handle when a user clicks a result from the search screen.
   * 
   */
  async onSearchResultPressed(r: AnyResource): Promise<void> {
    const { translation: { templates: { app_resource_not_found } } } = this.props;

    let result: SomeResult<AnyResource> | null = null;
    if (r.type === OrgType.GGMN) {
      //TODO: This is a hack because the GGMN api is broken - need to fix this properly
      result = await this.appApi.getResource(r.groundwaterStationId);
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
    const { loadingSearchResult } = this.state;

    if (loading) {
      return <PassiveLoadingIndicator/>
    }

    if (loadingSearchResult) {
      return <PassiveLoadingIndicator />
    }
    
    return null;
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
    const { userId } = this.props;
    const { 
      resource_detail_new, 
      resource_detail_edit_resource,
      resource_detail_edit_readings, 
    } = this.props.translation.templates;

    if (!hasSelectedResource || isNullOrUndefined(selectedResource)) {
      return null;
    }

    let groundwaterStationId: string | null= null;
    if (selectedResource.type === OrgType.GGMN) {
      groundwaterStationId = selectedResource.groundwaterStationId;
    }

    return (
      <ResourceDetailSection
        isPending={selectedResource.pending}
        hideTopBar={false}
        config={this.props.config}
        resourceId={selectedResource.id}
        temporaryGroundwaterStationId={groundwaterStationId}
        //TODO: fix this to handle only resourceId
        onAddReadingPressed={(resourceId: string) => {
          navigateTo(this.props, 'screen.NewReadingScreen', resource_detail_new, {
            resourceId,
            groundwaterStationId,
            //TODO: fix
            resourceType: 'well',
            config: this.props.config,
            userId: this.props.userId
          });
        }}
        onEditReadingsPressed={(resourceId: string) => {
          showModal(this.props, 'screen.EditReadingsScreen', resource_detail_edit_readings, {
            resourceId,
            resourceType: 'well',
            config: this.props.config,
          })
        }}
        onEditResourcePressed={(pendingResource: PendingResource) => {
          showModal(this.props, 'screen.menu.EditResourceScreen', resource_detail_edit_resource, {
            resourceId: pendingResource.id,
            resource: pendingResource,
            resourceType: 'well',
            config: this.props.config,
            userId: this.props.userId,
          })
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
            onCalloutPressed={() => console.log("nothing")}
          />}
        {mapState === MapStateOption.fullscreen ? null :
          <ScrollView
            style={{ flex: 1 }}
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