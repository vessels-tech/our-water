import * as React from 'react';
import { Component } from 'react';
import { Text } from 'react-native-elements';
import { ConfigFactory } from '../config/ConfigFactory';
import BaseApi from '../api/BaseApi';
import { View, ToastAndroid } from 'react-native';
import { maybeLog, navigateTo, getShortIdOrFallback } from '../utils';
import { bgLight } from '../utils/Colors';
import { SyncMeta, ActionMeta } from '../typings/Reducer';
import PassiveLoadingIndicator from '../components/common/PassiveLoadingIndicator';
import { TranslationFile } from 'ow_translations';
import { AppState, CacheType } from '../reducers';
import { UserType } from '../typings/UserTypes';
import { LocationType, Location } from '../typings/Location';
import { connect } from 'react-redux'
import Loading from '../components/common/Loading';
import { isNullOrUndefined } from 'util';
import MapSection, { MapRegion } from '../components/MapSection';
import { MapStateOption } from '../enums';
import * as appActions from '../actions/index';
import MapView, { Region } from 'react-native-maps';
import { MaybeExternalServiceApi } from '../api/ExternalServiceApi';
import { ResultType, SomeResult } from '../typings/AppProviderTypes';
import { compose } from 'redux';
import { withTabWrapper } from '../components/TabWrapper';
import { PendingResource } from '../typings/models/PendingResource';
import { AnyResource } from '../typings/models/Resource';

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
  resourcesMeta: SyncMeta,
  translation: TranslationFile,
  pendingResources: PendingResource[],
  shortIdCache: CacheType<string>,
}

export interface ActionProps {
  addRecent: any,
  loadResourcesForRegion: (api: BaseApi, userId: string, region: Region) => SomeResult<void>,
}


export interface State {
  initialRegion?: MapRegion,
  mapState: MapStateOption,
  hasSelectedResource: boolean,
  selectedResource?: AnyResource,
}


class SimpleMapScreen extends Component<OwnProps & StateProps & ActionProps> {
  mapRef?: MapView;
  state: State = {
    mapState: MapStateOption.default,
    hasSelectedResource: false,
    initialRegion: {
      latitude: this.props.location.coords.latitude,
      longitude: this.props.location.coords.longitude,
      latitudeDelta: 3.0,
      longitudeDelta: 3.0,
    },
  };
  appApi: BaseApi;
  externalApi: MaybeExternalServiceApi;

  constructor(props: OwnProps & StateProps & ActionProps) {
    super(props);

    //@ts-ignore
    this.appApi = props.config.getAppApi();
    this.externalApi = props.config.getExternalServiceApi();

    //binds
    this.getMapRef = this.getMapRef.bind(this);
    this.onMapRegionChange = this.onMapRegionChange.bind(this);
    this.selectResource = this.selectResource.bind(this);
    this.clearSelectedResource = this.clearSelectedResource.bind(this);
    this.updateGeoLocation = this.updateGeoLocation.bind(this);
    this.onCalloutPressed = this.onCalloutPressed.bind(this);
    this.onMapStateChanged = this.onMapStateChanged.bind(this);
  }

  getPassiveLoadingIndicator() {
    const { resourcesMeta: { loading } } = this.props;

    if (!loading) {
      return null;
    }

    return <PassiveLoadingIndicator/>
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

  getMapRef(ref: any) {
    this.mapRef = ref;
  }

  selectResource(resource: AnyResource | PendingResource ) {
    this.setState({
      hasSelectedResource: true,
      selectedResource: resource,
    });

    if (resource.pending) {
      //Don't add to recents if it's pending.
      return;
    }
    
    this.props.addRecent(this.appApi, this.props.userId, resource);
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

  onCalloutPressed(resource: AnyResource | PendingResource) {
    const shortId = getShortIdOrFallback(resource.id, this.props.shortIdCache);
    navigateTo(this.props, 'screen.SimpleResourceDetailScreen', shortId, {
      resourceId: resource.id,
      config: this.props.config,
      userId: this.props.userId,
      isPending: resource.pending,
    });
  }

  onMapStateChanged(m: MapStateOption) {
    this.setState({ mapState: m })
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
        flexDirection: 'column',
      }}>
        {this.getPassiveLoadingIndicator()}
        {isNullOrUndefined(initialRegion) ? null :
          <MapSection
            mapRef={this.getMapRef}
            initialRegion={initialRegion}
            onMapRegionChange={this.onMapRegionChange}
            onResourceSelected={this.selectResource}
            onResourceDeselected={this.clearSelectedResource}
            onGetUserLocation={this.updateGeoLocation}
            onMapStateChanged={this.onMapStateChanged}
            // Will never have a selected resource?
            hasSelectedResource={false}
            shouldShrinkForSelectedResource={false}
            shouldShowCallout={true}
            // shouldShowCallout={false}
            shouldDisplayFullSceenButton={false}
            onCalloutPressed={this.onCalloutPressed}
          />}
      </View>
    )
  }

}

//If we don't have a user id, we should load a different app I think.
const mapStateToProps = (state: AppState, ownProps: OwnProps): StateProps => {
  let userId = ''; //I don't know if this fixes the problem...

  //Default location
  let location: Location = { type: LocationType.LOCATION, coords: { latitude: -20.4010, longitude: 32.3373 } };
  if (state.user.type !== UserType.NO_USER) {
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
    resourcesMeta: state.resourcesMeta,
    translation: state.translation,
    pendingResources: state.pendingSavedResources,
    shortIdCache: state.shortIdCache,
  }
}

const mapDispatchToProps = (dispatch: any): ActionProps => {
  return {
    addRecent: (api: BaseApi, userId: string, resource: AnyResource) => {
      dispatch(appActions.addRecent(api, userId, resource))
    },
    loadResourcesForRegion: (api: BaseApi, userId: string, region: Region) =>
      dispatch(appActions.getResources(api, userId, region)),
  };
}

// export default connect(mapStateToProps, mapDispatchToProps)(SimpleMapScreen);

const enhance = compose(
  withTabWrapper,
  connect(mapStateToProps, mapDispatchToProps),
);

export default enhance(SimpleMapScreen);
