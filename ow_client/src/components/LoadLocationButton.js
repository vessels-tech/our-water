import React, { Component } from 'react';
import {
  ActivityIndicator,
  Text,
  View,
  TextInput
} from 'react-native';
import { Button, Icon } from 'react-native-elements';
import PropTypes from 'prop-types';

import {
  getLocation,
} from '../utils';

class LoadLocationButton extends Component<Props> {

  constructor(props) {
    super(props);

    this.state = {
      loading: false
    };
  }

  updateGeoLocation() {
    this.setState({
      loading: true
    });

    return getLocation()
    .then(location => {
      this.setState({loading: false});
      this.props.onComplete(location);
    })
    .catch(err => {
      //TODO: display error to user
      console.log('err', err);
      this.setState({loading: false});
    });
  }

  render() {

    return (
    
      <View style={{
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: "#FF6767",
        borderRadius: 20,
        width:40,
        height:40,
      }}>
        {this.state.loading ? 
          <ActivityIndicator 
            size="small" 
            color="#697689"
            />:
          <Icon 
            reverse
            raised
            size={15}
            name={"near-me"}
            onPress={() => this.updateGeoLocation()}
            color={"#FF6767"}
          />
        }
      </View>
    );
  }

}

LoadLocationButton.propTypes = {
  onComplete: PropTypes.func.isRequired,
}

export default LoadLocationButton;