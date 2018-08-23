import React, { Component } from 'react';
import { Text, View } from 'react-native';
import { Marker } from 'react-native-maps';

export interface Props {
  geometry: any,
  pointCount: number,
  clusterStyle: any,
  clusterTextStyle: any,
  onClusterPress: any,
  marker: any,
  clusterId: any,
}

export default class CustomMarker extends Component {
  props: Props;

  constructor(props: Props) {
    super(props);
    this.props = props;
  }

  shouldComponentUpdate(nextProps: Props) {
    return !(this.props.geometry === nextProps.geometry
      && this.props.pointCount === nextProps.pointCount);
  }

  render() {
    if (this.props.pointCount > 0) {
      return (
        <Marker
          coordinate={{
            longitude: this.props.geometry.coordinates[0],
            latitude: this.props.geometry.coordinates[1],
          }}
          onPress={this.props.pointCount > 0 && this.props.onClusterPress}
        >
          <View style={this.props.clusterStyle}>
            <Text style={this.props.clusterTextStyle}>
              {this.props.pointCount}
            </Text>
          </View>
        </Marker>
      );
    }
    return this.props.marker;
  }
}