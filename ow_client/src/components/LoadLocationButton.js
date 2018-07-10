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
import { textDark, primary } from '../utils/Colors';

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
        backgroundColor: primary,
        borderRadius: 50,
        width:45,
        height:45,
      }}>
        {this.state.loading ? 
          <ActivityIndicator 
            size="large" 
            color={textDark}
            />:
          <Icon 
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
        }
      </View>
    );
  }

}

LoadLocationButton.propTypes = {
  onComplete: PropTypes.func.isRequired,
}

export default LoadLocationButton;