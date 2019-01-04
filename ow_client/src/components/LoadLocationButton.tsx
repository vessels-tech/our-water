import * as React from 'react'; import { Component } from 'react';
import {
  ActivityIndicator,
  View,
} from 'react-native';
import { Icon } from 'react-native-elements';

import {
  getLocation,
} from '../utils';
import { primary, secondary, secondaryText } from '../utils/Colors';
import * as appActions from '../actions/index';
import { AppState } from '../reducers';
import { connect } from 'react-redux'
import { NoLocation, Location, LocationType } from '../typings/Location';
import { SomeResult, ResultType } from '../typings/AppProviderTypes';
import { SyncMeta } from '../typings/Reducer';

export interface OwnProps {
  style?: any,
  onComplete?: (thing: any) => void,
  color?: string,
  textColor?: string,
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
      this.props.onComplete && this.props.onComplete(result.result);
    }
  }

  render() {
    const { locationMeta: { loading } } = this.props;

    const viewStyle = {
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: this.props.color ? this.props.color : secondary,
      borderRadius: 50,
      width: 45,
      height: 45,
      marginHorizontal: 10,
      marginTop: 10,
      ...this.props.style
    }

    return (
      <View style={{ ...viewStyle }}>
        {loading ? <ActivityIndicator
          size="large"
          color={secondaryText}
        /> :
          <Icon
            containerStyle={{
              borderRadius: 50,
              backgroundColor: this.props.color ? this.props.color : secondary,
              width: 45,
              height: 45,
            }}
            reverse={true}
            raised={true}
            // size={20}
            name={"near-me"}
            onPress={() => this.updateGeoLocation()}
            iconStyle={{
              color: this.props.textColor ? this.props.textColor : secondaryText
            }}
            color={this.props.color ? this.props.color : secondary}
          />
        } 
      </View>
    )
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