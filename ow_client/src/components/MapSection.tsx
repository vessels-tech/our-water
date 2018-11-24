import * as React from 'react'; import { Component } from 'react';
import ClusteredMapView from "./common/ClusteredMapView";
import { View } from "react-native";
import MapView, { Callout, Marker, Region } from 'react-native-maps';
import { BasicCoords, DeprecatedResource } from '../typings/models/OurWater';
import { MapHeightOption, MapStateOption } from '../enums';
import { bgMed, primaryDark, primaryText, primary, secondaryLight, secondary } from '../utils/Colors';
import { getShortId, formatCoords, imageForResourceType, getSelectedResourceFromCoords, randomPrettyColorForId, getSelectedPendingResourceFromCoords, getShortIdOrFallback } from '../utils';
import { isNullOrUndefined } from 'util';
import LoadLocationButton from './LoadLocationButton';
import IconButton from './common/IconButton';
import { Location } from '../typings/Location';
import { AnyResource } from '../typings/models/Resource';
import { OrgType } from '../typings/models/OrgType';
import { PendingResource } from '../typings/models/PendingResource';
import { Text } from 'react-native-elements';
import { AppState } from '../reducers';
import { connect } from 'react-redux';
import MapCallout from './common/MapCallout';

export type MapRegion = {
  latitude: number,
  longitude: number,
  latitudeDelta: number,
  longitudeDelta: number,
}


export interface StateProps {
  shortIdCache: Map<string, string>, //resourceId => shortId
}

export interface ActionProps {

}


export interface State {
  hasSelectedResource: boolean,
  mapHeight: MapHeightOption
  mapState: MapStateOption,
}

export interface OwnProps {
  // mapHeight: MapHeightOption,
  // mapState: MapStateOption,
  onGetUserLocation: any,
  onMapRegionChange: any,
  onResourceSelected: (r: AnyResource | PendingResource) => void,
  onResourceDeselected: any,
  onMapStateChanged: (h: MapStateOption) => void,
  initialRegion: MapRegion,
  resources: AnyResource[],
  pendingResources: PendingResource[],
  selectedResource?: AnyResource | PendingResource,
  hasSelectedResource: boolean,
  mapRef: any,
  shouldDisplayFullSceenButton: boolean,
  shouldShrinkForSelectedResource: boolean,
  shouldShowCallout: boolean,
  onCalloutPressed: (r: AnyResource | PendingResource) => void,
}

class MapSection extends Component<OwnProps & StateProps & ActionProps> {
  state: State;
  mapRef?: any;

  constructor(props: OwnProps & StateProps & ActionProps) {
    super(props);

    this.state = {
      hasSelectedResource: this.props.hasSelectedResource,
      mapHeight: MapHeightOption.default,
      mapState: MapStateOption.default,
    }
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

  // componentDidUpdate() {
  //   //TODO: handle case where user selects the resource from another screen
  //   if (this.props.hasSelectedResource !== this.state)
  //   this.setState({
  //     hasSelectedResource: this.props.hasSelectedResource
  //   });
  // }

  shouldComponentUpdate(nextProps: OwnProps & StateProps & ActionProps, nextState: State): boolean {

    return true;
  }

  //
  // Handlers
  //----------------------------------------------------------------------


  onClusterPressed(event: any) {
    // console.log("onClusterPressed", event);
  }

  /**
   * When user clicks on a resource, make the map small, 
   * scroll to the top of the view, and display the resource details
   * 
   */
  focusResource(coordinate: BasicCoords) {
    const resource = getSelectedResourceFromCoords(this.props.resources, coordinate);
    if (isNullOrUndefined(resource)) {
      console.warn("tried to call focusResource, but resource was null");
      return;
    }

    this.selectResource(resource);
  }

  focusPendingResource(coordinate: BasicCoords) {
    const resource = getSelectedPendingResourceFromCoords(this.props.pendingResources, coordinate);
    if (isNullOrUndefined(resource)) {
      console.warn("tried to call focusResource, but resource was null");
      return;
    }

    this.selectResource(resource);
  }

  //TODO: fix infinite loop here
  selectResource(resource: AnyResource | PendingResource) {
    let shrinkState = {
      mapHeight: MapHeightOption.small,
      mapState: MapStateOption.small,
    };
    let newState = {
      hasSelectedResource: true
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
    // console.log('region changed', region);
  }


  clearSelectedResource() {

    this.setState({
      mapState: MapStateOption.default,
      mapHeight: MapHeightOption.default,
      hasSelectedResource: false,
      selectedResource: null,
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
          onComplete={(l: Location) => this.props.onGetUserLocation(l)}
        />
        {this.props.shouldDisplayFullSceenButton ? 
          <IconButton
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
        <IconButton
          color={secondary}
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

    return (
      <View style={{
        backgroundColor: bgMed,
        flex: mapState === MapStateOption.small ? 0.75 : 2.2,
        maxHeight: mapHeight
      }}>
        <ClusteredMapView
          mapRef={(ref: any) => {
            this.props.mapRef(ref);
          }}
          style={{
            position: 'relative',
            width: '100%',
            height: mapHeight,
          }}
          radius={25}
          clustering={false}
          clusterColor={primaryDark}
          clusterTextColor={primaryText}
          clusterBorderColor={primaryText}
          onClusterPress={(e: any) => this.onClusterPressed(e.nativeEvent)}
          initialRegion={initialRegion}
          onRegionChangeComplete={(region: Region) => this.props.onMapRegionChange(region)}
        >
          {/* TODO: Hide and show different groups at different levels */}
          {/* Pincode */}
          {/* Villages */}
          {resources.map((resource: AnyResource) => {
            const shortId = getShortIdOrFallback(resource.id, this.props.shortIdCache);
            return <Marker
              //@ts-ignore
              collapsable={true}
              key={`any_${resource.id}`}
              coordinate={formatCoords(resource.coords)}
              title={`${shortId}`}
              pinColor={secondary}

              // description={resource.resourceType}
              
              //This is making massive images on some devices
              // image={imageForResourceType(resource.resourceType)}
              onPress={(e: any) => this.focusResource(e.nativeEvent.coordinate)}
            >
              {this.getCalloutForResource(resource)}
            </Marker>
          }
          )}
          {pendingResources.map((p: PendingResource) => {
            return <Marker
              //@ts-ignore
              collapsable={true}
              key={`pending_${p.id}`}
              coordinate={p.coords}
              title={`${p.id}`}
              // description={resource.resourceType}

              //This is making massive images on some devices
              // image={imageForResourceType(resource.resourceType)}
              // TODO: make this work for pending resource
              onPress={(e: any) => this.focusPendingResource(e.nativeEvent.coordinate)}
            >
              {/* {this.getCalloutForResource(resource)} */}
            </Marker>
          })}
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
    )
  }
}

//If we don't have a user id, we should load a different app I think.
const mapStateToProps = (state: AppState, ownProps: OwnProps): StateProps => {
  return {
    shortIdCache: state.shortIdCache,
  };
}

const mapDispatchToProps = (dispatch: any): ActionProps => {
  return {

  }
}

export default connect(mapStateToProps, mapDispatchToProps)(MapSection);


