import React, { Component } from 'react';
import MapView from 'react-native-maps';
// @ts-ignore
import { width as w, height as h } from 'react-native-dimension';
import SuperCluster from 'supercluster';
import CustomMarker from './CustomMarker';

export interface Props {
  clusterBorderColor: string,
  clusterBorderWidth?: number,
  clusterColor: string,
  region?: any,
  clusterTextSize?: number,
  clusterTextColor: any,
  clustering: any,
  superCluster?: any,
  radius?: number,
  onClusterPress?: any,
  children?: any,
  style?: any,
}

export interface State {
  currentRegion?: any,
  clusterStyle: {
    borderRadius: any,
    backgroundColor: any,
    borderColor: any,
    borderWidth: any,
    width: any,
    height: any,
    justifyContent: any,
    alignItems: any,
  },
  clusterTextStyle: {
    fontSize: any,
    color: any,
    fontWeight: any,
  },
  markers: any[],
  clusteredMarkers?: any
  otherChildren?: any
}

/**
 * Map view with clustering.
 * Originally from https://github.com/venits/react-native-map-clustering/blob/master/MapView/MapWithClustering.js
 */
class ClusteredMapView extends Component {
  props: Props = {
    clustering: true,
    radius: w(5),
    clusterColor: '#F5F5F5',
    clusterTextColor: '#FF5252',
    clusterBorderColor: '#FF5252',
    clusterBorderWidth: 1,
    clusterTextSize: totalSize(2.4),
    onClusterPress: () => { },
  }
  superCluster: any;
  root: any;

  state: State = {
    currentRegion: this.props.region,
    clusterStyle: {
      borderRadius: w(15),
      backgroundColor: this.props.clusterColor,
      borderColor: this.props.clusterBorderColor,
      borderWidth: this.props.clusterBorderWidth,
      width: w(15),
      height: w(15),
      justifyContent: 'center',
      alignItems: 'center',
    },
    clusterTextStyle: {
      fontSize: this.props.clusterTextSize,
      color: this.props.clusterTextColor,
      fontWeight: 'bold',
    },
    markers: [],
  };

  constructor(props: Props) {
    super(props);
  }
 
  componentDidMount() {
    this.createMarkersOnMap();
  }

  componentWillReceiveProps() {
    this.createMarkersOnMap();
  }

  onRegionChangeComplete = (region: any) => {
    const { latitude, latitudeDelta, longitude, longitudeDelta } = this.state.currentRegion;
    if (region.longitudeDelta <= 80) {
      if ((Math.abs(region.latitudeDelta - latitudeDelta) > latitudeDelta / 8)
        || (Math.abs(region.longitude - longitude) >= longitudeDelta / 5)
        || (Math.abs(region.latitude - latitude) >= latitudeDelta / 5)) {
        this.calculateClustersForMap(region);
      }
    }
  };

  createMarkersOnMap = () => {
    const markers: any[] = [];
    const otherChildren: any[] = [];

    React.Children.forEach(this.props.children, (marker) => {
      if (!marker) {
        return
      }
      // @ts-ignore
      if (marker.props && marker.props.coordinate && marker.props.collapsable) {
        markers.push({
          marker,
          properties: { point_count: 0 },
          geometry: {
            type: 'Point',
            coordinates: [
              // @ts-ignore
              marker.props.coordinate.longitude,
              // @ts-ignore
              marker.props.coordinate.latitude,
            ],
          },
        });
      } else {
        otherChildren.push(marker);
      }
    });

    if (!this.superCluster) {
      this.superCluster = SuperCluster({
        radius: this.props.radius,
        maxZoom: 9,
        minZoom: 1,
      });
    }
    this.superCluster.load(markers);

    this.setState({
      markers,
      otherChildren,
    }, () => {
      this.calculateClustersForMap();
    });
  };

  calculateBBox = (region: any) => [
    region.longitude - region.longitudeDelta, // westLng - min lng
    region.latitude - region.latitudeDelta, // southLat - min lat
    region.longitude + region.longitudeDelta, // eastLng - max lng
    region.latitude + region.latitudeDelta// northLat - max lat
  ];

  getBoundsZoomLevel = (bounds: any[], mapDim: any) => {
    const WORLD_DIM = { height: mapDim.height, width: mapDim.width };
    const ZOOM_MAX = 20;

    function latRad(lat: number) {
      const sin = Math.sin(lat * Math.PI / 180);
      const radX2 = Math.log((1 + sin) / (1 - sin)) / 2;
      return Math.max(Math.min(radX2, Math.PI), -Math.PI) / 2;
    }

    function zoom(mapPx: number, worldPx: number, fraction: number) {
      return Math.floor(Math.log(mapPx / worldPx / fraction) / Math.LN2);
    }

    const latFraction = (latRad(bounds[3]) - latRad(bounds[1])) / Math.PI;
    const lngDiff = bounds[2] - bounds[0];
    const lngFraction = ((lngDiff < 0) ? (lngDiff + 360) : lngDiff) / 360;
    const latZoom = zoom(mapDim.height, WORLD_DIM.height, latFraction);
    const lngZoom = zoom(mapDim.width, WORLD_DIM.width, lngFraction);

    return Math.min(latZoom, lngZoom, ZOOM_MAX);
  };

  calculateClustersForMap = async (currentRegion = this.state.currentRegion) => {
    let clusteredMarkers = [];

    if (this.props.clustering && this.superCluster) {
      const bBox = this.calculateBBox(this.state.currentRegion);
      let zoom = this.getBoundsZoomLevel(bBox, { height: h(100), width: w(100) });
      const clusters = await this.superCluster.getClusters([bBox[0], bBox[1], bBox[2], bBox[3]], zoom);

      clusteredMarkers = clusters.map((cluster: any) => (
      <CustomMarker
        pointCount={cluster.properties.point_count}
        clusterId={cluster.properties.cluster_id}
        geometry={cluster.geometry}
        clusterStyle={this.state.clusterStyle}
        clusterTextStyle={this.state.clusterTextStyle}
        marker={cluster.properties.point_count === 0 ? cluster.marker : null}
        key={JSON.stringify(cluster.geometry) + cluster.properties.cluster_id + cluster.properties.point_count}
        onClusterPress={this.props.onClusterPress}
      />));
    } else {
      clusteredMarkers = this.state.markers.map(marker => marker.marker);
    }

    this.setState({
      clusteredMarkers,
      currentRegion,
    });
  };

  removeChildrenFromProps = (props: Props) => {
    const newProps: any = {};
    Object.keys(props).forEach((key) => {
      if (key !== 'children') {
        //@ts-ignore
        newProps[key] = props[key];
      }
    });
    return newProps;
  };

  render() {
    return (
      <MapView
        {...this.removeChildrenFromProps(this.props)}
        ref={(ref) => { this.root = ref; }}
        region={this.state.currentRegion}
        onRegionChangeComplete={this.onRegionChangeComplete}
      >
        {this.state.clusteredMarkers}
        {this.state.otherChildren}
      </MapView>
    );
  }
}

const totalSize = (num: number) => (Math.sqrt((h(100) * h(100)) + (w(100) * w(100))) * num) / 100;

export default ClusteredMapView;