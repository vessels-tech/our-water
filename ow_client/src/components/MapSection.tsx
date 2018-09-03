import * as React from 'react'; import { Component } from 'react';
import ClusteredMapView from "./common/ClusteredMapView";
import { View } from "react-native";
import MapView, { Marker, Region } from 'react-native-maps';
import { Resource, BasicCoords } from '../typings/models/OurWater';
import { MapHeightOption, MapStateOption } from '../enums';
import { bgMed, primaryDark, textLight } from '../utils/Colors';
import { getShortId, formatCoords, imageForResourceType, getSelectedResourceFromCoords } from '../utils';
import { isNullOrUndefined } from 'util';
import LoadLocationButton from './LoadLocationButton';
import IconButton from './IconButton';
import { Location } from '../typings/Location';

export type MapRegion = {
  latitude: number,
  longitude: number,
  latitudeDelta: number,
  longitudeDelta: number,
}

export interface State {
  hasSelectedResource: boolean,
  mapHeight: MapHeightOption
  mapState: MapStateOption,
}

export interface Props {
  // mapHeight: MapHeightOption,
  // mapState: MapStateOption,
  onGetUserLocation: any,
  onMapRegionChange: any,
  onResourceSelected: any,
  region: MapRegion,
  resources: Resource[],
  userRegion: MapRegion,
  selectedResource?: Resource,
  hasSelectedResource: boolean,
  mapRef: any,

}

export default class MapSection extends Component<Props> {
  state: State;
  mapRef?: any;

  constructor(props: Props) {
    super(props);

    this.state = {
      hasSelectedResource: this.props.hasSelectedResource,
      mapHeight: MapHeightOption.default,
      mapState: MapStateOption.default,
    }
    
  }

  componentDidUpdate() {
    //TODO: handle case where user selects the resource from another screen
    if (this.props.hasSelectedResource === true) {
      this.setState({
        hasSelectedResource: true,
      });
    }

  }

  //
  // Handlers
  //----------------------------------------------------------------------


  onClusterPressed(event: any) {
    console.log("onClusterPressed", event);
  }

  /**
   * When user clicks on a resource, make the map small, 
   * scroll to the top of the view, and display the resource details
   * 
   * @param {*} param0 
   */
  focusResource(coordinate: BasicCoords) {
    const resource = getSelectedResourceFromCoords(this.props.resources, coordinate);
    if (isNullOrUndefined(resource)) {
      console.warn("tried to call focusResource, but resource was null");
      return;
    }

    this.selectResource(resource);
  }

  selectResource(resource: Resource) {
    this.setState({
      mapHeight: MapHeightOption.small,
      mapState: MapStateOption.small,
      hasSelectedResource: true,
      selectedResource: resource,
    });

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

    this.setState({
      mapState: newMapState,
      mapHeight: newMapHeight,
    });
  }

  onRegionChange(region: any) {
    console.log('region changed', region);
  }


  clearSelectedResource() {

    this.setState({
      mapState: MapStateOption.default,
      mapHeight: MapHeightOption.default,
      hasSelectedResource: false,
      selectedResource: null,
    });
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
        <IconButton
          name={fullscreenIcon}
          onPress={() => this.toggleFullscreenMap()}
        />
      </View>
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


  render() {
    const { mapHeight } = this.state;
    const { region, userRegion, resources } = this.props;

    console.log("User region is:", userRegion);
    console.log("Map region is: ", region);

    return (
      <View style={{
        backgroundColor: bgMed,
        // height: 500,
      }}>
        <ClusteredMapView
          mapRef={(ref: any) => {
            // console.log("ClusteredMapView.render ref is", ref);
            this.props.mapRef(ref);
          }}
          style={{
            position: 'relative',
            width: '100%',
            height: mapHeight,
          }}
          radius={25}
          clustering={true}
          clusterColor={primaryDark}
          clusterTextColor={textLight}
          clusterBorderColor={textLight}
          onClusterPress={(e: any) => this.onClusterPressed(e.nativeEvent)}
          region={region}
          onRegionChangeComplete={(region: Region) => this.props.onMapRegionChange(region)}
          // onRegionChangeComplete={(region: any) => () => console.log("onRegionChangeComplete")}
        >
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
              image={imageForResourceType(resource.resourceType)}
              onPress={(e: any) => this.focusResource(e.nativeEvent.coordinate)}
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
    )
  }

}