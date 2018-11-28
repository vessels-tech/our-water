import * as React from 'react'; import { PureComponent } from 'react';
import { Marker, MarkerProps } from 'react-native-maps';

// import MapView from 'react-native-maps'
// import isEqual from 'lodash.isequal'

export interface Props extends MarkerProps {
  // children: React.ReactNode,
  onCalloutPress?: (r: any) => any,
};

export interface State {
  tracksViewChanges: boolean,
};

export default class MapMarker extends PureComponent<Props, State> {
  state = {
    tracksViewChanges: true,
  }

  componentWillReceiveProps(nextProps: any) {
    if (this.props !== nextProps) {
      this.setState(() => ({
        tracksViewChanges: true,
      }))
    }
  }

  componentDidUpdate() {
    if (this.state.tracksViewChanges) {
      this.setState(() => ({
        tracksViewChanges: false,
      }))
    }
  }
  render() {
    return (
      <Marker
        tracksViewChanges={this.state.tracksViewChanges}
        {...this.props}
      >{this.props.children}</Marker>
    )
  }
}