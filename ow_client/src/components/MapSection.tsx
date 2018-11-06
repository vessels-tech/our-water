import * as React from 'react'; import { Component } from 'react';
import ClusteredMapView from "./common/ClusteredMapView";
import { View, ProgressBarAndroid, Text, TouchableNativeFeedback } from "react-native";
import MapView, { Callout, Marker, Region } from 'react-native-maps';
import { BasicCoords, DeprecatedResource } from '../typings/models/OurWater';
import { MapHeightOption, MapStateOption } from '../enums';
import { bgMed, primaryDark, primaryText, primary, secondaryLight, secondary } from '../utils/Colors';
import { getShortId, formatCoords, imageForResourceType, getSelectedResourceFromCoords, randomPrettyColorForId } from '../utils';
import { isNullOrUndefined } from 'util';
import LoadLocationButton from './LoadLocationButton';
import IconButton from './common/IconButton';
import { Location } from '../typings/Location';
import { Button } from 'react-native-elements';

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
  onResourceDeselected: any,
  onMapStateChanged: (h: MapStateOption) => void,
  initialRegion: MapRegion,
  resources: DeprecatedResource[],
  selectedResource?: DeprecatedResource,
  hasSelectedResource: boolean,
  mapRef: any,
  shouldShrinkForSelectedResource: boolean,
  shouldShowCallout: boolean,
  onCalloutPressed?: (r: DeprecatedResource) => void,
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

  componentWillReceiveProps(nextProps: Props) {
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

  shouldComponentUpdate(nextProps: Props, nextState: State): boolean {

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

  //TODO: fix infinite loop here
  selectResource(resource: DeprecatedResource) {
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
          color={secondary}
          name="clear"
          onPress={() => this.clearSelectedResource()}
        />
      </View>
    );
  }

  getCalloutForResource(resource: DeprecatedResource) {
    if (!this.props.shouldShowCallout) {
      return null;
    }

    //This reveals a code smell
    if (!this.props.onCalloutPressed) {
      throw new Error("no onCalloutPressed, but shouldShowCallout is true");
    }

    return (
      <Callout 
        onPress={() => this.props.onCalloutPressed && this.props.onCalloutPressed(resource)}
        tooltip
      >
        <View style={{
          flex: 1,
          padding: 10,
          margin: 10,
          backgroundColor: randomPrettyColorForId(resource.id),
        }}>
          <Text style={{ fontWeight: '800', fontSize: 20 }}>{resource.resourceType}: {resource.id} ></Text>
        </View>
      </Callout>
    )
  }


  render() {
    const { mapHeight } = this.state;
    const { initialRegion, resources } = this.props;

    // console.log("MapSection rendering:", resources.length, "resources.");

    return (
      <View style={{
        backgroundColor: bgMed,
        flex: 2,
        maxHeight: mapHeight
      }}>
        <ClusteredMapView
          mapRef={(ref: any) => {
            this.props.mapRef(ref);
          }}
          style={{
            position: 'relative',
            width: '100%',
            // height: '100%',
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
          {resources.map(resource => {
            const shortId = getShortId(resource.id);
            return <Marker
              //@ts-ignore
              collapsable={true}
              key={shortId}
              coordinate={formatCoords(resource.coords)}
              title={`${shortId}`}
              // description={resource.resourceType}
              
              //This is making massive images on some devices
              // image={imageForResourceType(resource.resourceType)}
              onPress={(e: any) => this.focusResource(e.nativeEvent.coordinate)}
            >
              {this.getCalloutForResource(resource)}
            </Marker>
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