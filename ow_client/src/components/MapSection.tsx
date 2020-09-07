import * as React from 'react'; import { Component } from 'react';
import { View, TouchableWithoutFeedback } from "react-native";
import MapView, { Callout, Marker, Region } from 'react-native-maps';
import { BasicCoords, DeprecatedResource } from '../typings/models/OurWater';
import { MapHeightOption, MapStateOption } from '../enums';
import { bgMed, primaryDark, primaryText, primary, secondaryLight, secondary, greyMed, greyDark, primaryLight } from '../utils/Colors';
import { getShortId, formatCoords, imageForResourceType, getSelectedResourceFromCoords, randomPrettyColorForId, getSelectedPendingResourceFromCoords, getShortIdOrFallback, maybeLog, debounced, getMarkerKey, pinColorForOrgAndResource, isInRegion } from '../utils';
import { isNullOrUndefined } from 'util';
import LoadLocationButton from './LoadLocationButton';
import IconButton from './common/IconButton';
import { Location } from '../typings/Location';
import { AnyResource } from '../typings/models/Resource';
import { OrgType } from '../typings/models/OrgType';
import { PendingResource } from '../typings/models/PendingResource';
import { AppState, CacheType } from '../reducers';
import { connect } from 'react-redux';
import MapCallout from './common/MapCallout';
import { diff } from "deep-object-diff";
import { ConfigFactory } from '../config/ConfigFactory';

import withPreventDoubleClick from './common/withPreventDoubleClick';
const IconButtonEx = withPreventDoubleClick(IconButton);

export type MapRegion = {
  latitude: number,
  longitude: number,
  latitudeDelta: number,
  longitudeDelta: number,
}

export interface StateProps {
  shortIdCache: CacheType<string>, //resourceId => shortId
  resources: AnyResource[],
  pendingResources: PendingResource[],
}

export interface ActionProps {

}

export interface DebugProps {
  renderCounter?: number,
}

export interface State {
  hasSelectedResource: boolean,
  mapHeight: MapHeightOption
  mapState: MapStateOption,
}

export interface OwnProps {
  config: ConfigFactory,
  onGetUserLocation: any,
  onMapRegionChange: any,
  onResourceSelected: (r: AnyResource | PendingResource) => void,
  onResourceDeselected: any,
  onMapStateChanged: (h: MapStateOption) => void,
  initialRegion: MapRegion,
  selectedResource?: AnyResource | PendingResource,
  hasSelectedResource: boolean,
  mapRef: any,
  shouldDisplayFullSceenButton: boolean,
  shouldShrinkForSelectedResource: boolean,
  shouldShowCallout: boolean,
  onCalloutPressed?: (r: AnyResource | PendingResource) => void,
}

class MapSection extends Component<OwnProps & StateProps & ActionProps & DebugProps> {
  state: State;
  mapRef?: any;
  currentRegion: Region;
  debouncedOnRegionChangeComplete: any;
  markers: CacheType<Marker> = {};
  selectedMapMarkerRef?: Marker;

  constructor(props: OwnProps & StateProps & ActionProps & DebugProps) {
    super(props);

    this.state = {
      hasSelectedResource: this.props.hasSelectedResource,
      mapHeight: MapHeightOption.default,
      mapState: MapStateOption.default,
    }

    this.currentRegion = props.initialRegion;
    const waitTime = props.config.getMapRegionChangeDebounceTimeMs();
    this.debouncedOnRegionChangeComplete = debounced(waitTime, this.props.onMapRegionChange);
  }

  componentWillReceiveProps(nextProps: OwnProps & StateProps & ActionProps) {
    if (nextProps.hasSelectedResource !== this.state.hasSelectedResource) {
      let mapHeight = MapHeightOption.default
      let mapState = MapStateOption.default;

      if (nextProps.hasSelectedResource) {
        mapHeight = MapHeightOption.small;
        mapState = MapStateOption.small;
      }

      this.setState({
        hasSelectedResource: nextProps.hasSelectedResource,
        mapHeight,
        mapState,
      });
    }
  }

  shouldComponentUpdate(nextProps: OwnProps & StateProps & ActionProps, nextState: State): boolean {
    maybeLog("MapSection, shouldComponentUpdate()");
    if (Object.keys(diff(this.state, nextState)).length > 0) {
      return true;
    }

    // diff function has problems with babel: https://github.com/mattphillips/deep-object-diff/issues/33
    //If the props diff is only functions, then we shouldn't update!
    const propsDiff: any = diff(this.props, nextProps);
    delete propsDiff['renderCounter'];
    const functionsOnly = Object.keys(propsDiff).reduce((acc: boolean, curr: string) => {
      if (acc === false) {
        return acc;
      }
      return typeof propsDiff[curr] === 'function';
    }, true);

    if (functionsOnly) {
      maybeLog('MapSection shouldComponentUpdate skipping render');
      return !functionsOnly;
    }

    return true;
  }

  //
  // Handlers
  //----------------------------------------------------------------------


  onClusterPressed(event: any) {

  }

  /**
   * When user clicks on a resource, make the map small, 
   * scroll to the top of the view, and display the resource details
   * 
   */
  focusResource(resource: AnyResource | PendingResource) {
    //We shouldn't use the coords here - 
    // const resource = getSelectedResourceFromCoords(this.props.resources, coordinate);
    // const resource = this.props.resources.filter(r => r.id === resourceId).shift();
    if (isNullOrUndefined(resource)) {
      console.warn("tried to call focusResource, but resource was null");
      return;
    }

    this.selectResource(resource);
  }

  //TODO: fix infinite loop here?
  selectResource(resource: AnyResource | PendingResource) {
    this.selectedMapMarkerRef = this.markers[getMarkerKey(resource)] || null;
    let shrinkState = {
      mapHeight: MapHeightOption.small,
      mapState: MapStateOption.small,
    };
    let newState = {
      hasSelectedResource: true,
    };

    if (this.props.shouldShrinkForSelectedResource) {
      this.setState({
        ...shrinkState,
        ...newState,
      });

      this.props.onMapStateChanged(MapStateOption.small);
    } else {
      this.setState({
        ...newState,
      });
    }

    this.props.onResourceSelected(resource);
  }

  toggleFullscreenMap() {
    const { mapState } = this.state;

    if (this.selectedMapMarkerRef) {
      this.selectedMapMarkerRef.hideCallout();
    }

    let newMapState = MapStateOption.default;
    let newMapHeight: any = MapHeightOption.default;

    if (mapState === MapStateOption.default) {
      newMapState = MapStateOption.fullscreen;
      newMapHeight = MapHeightOption.fullscreen;
    }

    this.props.onMapStateChanged(newMapState);
    this.setState({
      mapState: newMapState,
      mapHeight: newMapHeight,
    });
    
  }

  onRegionChange(region: any) {

  }

  clearSelectedResource() {
    maybeLog("MapSection clearSelectedResource()");
    // const { selectedMapMarkerRef } = this.state;

    if (this.selectedMapMarkerRef) {
      this.selectedMapMarkerRef.hideCallout();
    }
    this.setState({
      mapState: MapStateOption.default,
      mapHeight: MapHeightOption.default,
      hasSelectedResource: false,
      selectedResource: null,
      selectedMapMarkerRef: null,
    });

    this.props.onResourceDeselected();
  }

  //
  // Rendering
  //----------------------------------------------------------------------

  getMapButtons() {
    const { mapState } = this.state;

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
        flexDirection: 'row',
        justifyContent: 'space-around',
      }}>
        <LoadLocationButton
          textColor={primaryText}
          color={primaryLight}
          onComplete={(l: Location) => this.props.onGetUserLocation(l)}
        />
        {this.props.shouldDisplayFullSceenButton ? 
          <IconButtonEx
            textColor={primaryText}
            color={primaryLight}
            name={fullscreenIcon}
            onPress={() => this.toggleFullscreenMap()}
          />
        : null }
      </View>
    );
  }

  //A button for the user to deselect a resource, and exit out
  //of small map mode
  getUpButton() {
    if (!this.props.shouldShrinkForSelectedResource) {
      return null;
    }

    const { hasSelectedResource } = this.state;

    if (!hasSelectedResource) {
      return null;
    }

    return (
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-around',
      }}>
        <IconButtonEx
          textColor={primaryText}
          color={primaryLight}
          name="clear"
          onPress={() => this.clearSelectedResource()}
        />
      </View>
    );
  }

  getCalloutForResource(resource: AnyResource) {    
    if (!this.props.shouldShowCallout) {
      return null;
    }

    //TD: code smell
    if (resource.type === OrgType.GGMN) {
      //GGMN Resources don't have callouts
      return;
    }

    //This reveals a code smell
    if (!this.props.onCalloutPressed) {
      throw new Error("no onCalloutPressed, but shouldShowCallout is true");
    }

    return (
      <MapCallout
        key={resource.id}
        resource={resource}
        //TODO: this will fail for GGMN I think
        onCalloutPressed={(resource) => this.props.onCalloutPressed(resource)}
        shortIdCache={this.props.shortIdCache}
      />
    );
  }

  

  render() {
    const { mapHeight, mapState } = this.state;
    const { initialRegion, resources, pendingResources } = this.props;
    maybeLog(`MapSection render(). Count: ${this.props.renderCounter}`);

    let flex = 1;
    if (!this.props.config.getMapScreenFullscreen()) {
      flex = mapState === MapStateOption.small ? 0.75 : 2.2;
    }

    return (
      <View style={{
        backgroundColor: bgMed,
        flex,
        maxHeight: mapHeight
      }}>
        <MapView
          ref={(ref: any) => {
            this.props.mapRef(ref);
          }}
          style={{
            position: 'relative',
            width: '100%',
            height: mapHeight,
          }}
          showsMyLocationButton={false}
          showsPointsOfInterest={false}
          showsUserLocation={true}
          initialRegion={initialRegion}
          onRegionChangeComplete={(region: Region) => {
            this.currentRegion = region;
            this.debouncedOnRegionChangeComplete(region);
          }}
        >
          {resources.map((resource: AnyResource) => {
            const shortId = getShortIdOrFallback(resource.id, this.props.shortIdCache);

            //Hide the resources from the map if they shouldn't be visible.
            if (!isInRegion(this.currentRegion, resource.coords)) {
              return null;
            }

            //@ts-ignore
            return <Marker
              ref={(ref: any) => {
                const key = getMarkerKey(resource);
                if (!ref) {
                  delete this.markers[key];
                }
                this.markers[key] = ref;
              }}
              collapsable={true}
              key={getMarkerKey(resource)}
              coordinate={formatCoords(resource.coords)}
              title={`${shortId}`}
              pinColor={pinColorForOrgAndResource(resource)}
              onPress={(e: any) => this.focusResource(resource)}
            >
              {this.getCalloutForResource(resource)}
            </Marker>
          }
          )}
          {pendingResources.map((p: PendingResource) => {
            //@ts-ignore
            return <Marker
              ref={(ref: any) => {
                const key = getMarkerKey(p);
                if (!ref) {
                  delete this.markers[key];
                }
                this.markers[key] = ref;
              }}
              collapsable={true}
              key={getMarkerKey(p)}
              coordinate={p.coords}
              title={`${p.id}`}
              pinColor={'navy'}
              onPress={(e: any) => this.focusResource(p)}
            >
              {this.getCalloutForResource(p)}
            </Marker>
          })}
        </MapView>
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
      )
    }
  }
  
  //If we don't have a user id, we should load a different app I think.
const mapStateToProps = (state: AppState, ownProps: OwnProps): StateProps => {
  return {
    shortIdCache: state.shortIdCache,
    resources: state.resources,
    pendingResources: state.pendingSavedResources,
  };
}

const mapDispatchToProps = (dispatch: any): ActionProps => {
  return {

  }
}

export default connect(mapStateToProps, mapDispatchToProps, null, { renderCountProp: 'renderCounter' })(MapSection);


