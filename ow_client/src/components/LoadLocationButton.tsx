import * as React from 'react'; import { Component } from 'react';
import {
  ActivityIndicator,
  View,
} from 'react-native';
import { Icon } from 'react-native-elements';

import {
  getLocation,
} from '../utils';
import { textDark, primary } from '../utils/Colors';
import * as appActions from '../actions/index';
import { AppState } from '../reducers';
import { connect } from 'react-redux'
import { NoLocation, Location, LocationType } from '../typings/Location';
import { SomeResult, ResultType } from '../typings/AppProviderTypes';
import { SyncMeta } from '../typings/Reducer';

export interface OwnProps {
  style?: any,
  onComplete: any,
}

export interface StateProps {
  location: Location | NoLocation,
  locationMeta: SyncMeta,
}

export interface ActionProps {
  getGeoLocation: () => SomeResult<Location>,

}


export interface State {
}

class LoadLocationButton extends Component<OwnProps & StateProps & ActionProps> {

  constructor(props: OwnProps & StateProps & ActionProps) {
    super(props);

  }

  async updateGeoLocation() {
    const result = await this.props.getGeoLocation();

    //TODO: this is less than ideal
    if (result.type === ResultType.SUCCESS) {
      this.props.onComplete(result.result);
    }
  }

  render() {
    const { locationMeta: { loading } } = this.props;

    const viewStyle = {
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: primary,
      borderRadius: 50,
      width: 45,
      height: 45,
      ...this.props.style
    }

    if (loading) {
      return (
        <View style={viewStyle}>
          <ActivityIndicator
            size="large"
            color={textDark}
          />
        </View>
      );
    }


    return (
      <Icon 
        containerStyle={viewStyle}
        reverse
        raised
        size={20}
        name={"near-me"}
        onPress={() => this.updateGeoLocation()}
        iconStyle={{
          color: textDark,
        }}
        color={primary}
      />
    );
  }
}



//If we don't have a user id, we should load a different app I think.
const mapStateToProps = (state: AppState, ownProps: OwnProps): StateProps => {
  return {
    location: state.location,
    locationMeta: state.locationMeta,
  }
}

const mapDispatchToProps = (dispatch: any) => {
  return {
    getGeoLocation: () => dispatch(appActions.getGeolocation())
  }
}


export default connect(mapStateToProps, mapDispatchToProps)(LoadLocationButton);