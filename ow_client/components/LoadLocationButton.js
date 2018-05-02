import React, { Component } from 'react';
import {
  Text,
  View,
  TextInput
} from 'react-native';
import { Button } from 'react-native-elements';
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
      <Button
        title={null}
        loading={this.state.loading}
        icon={{ name: 'near-me' }}
        buttonStyle={{ backgroundColor: 'rgba(111, 202, 186, 0.5)', borderRadius: 5 }}
        titleStyle={{ fontWeight: 'bold', fontSize: 23 }}
        onPress={() => this.updateGeoLocation()}
        underlayColor="transparent"
      />
    );
  }

}

LoadLocationButton.propTypes = {
  onComplete: PropTypes.func.isRequired,
}

export default LoadLocationButton;