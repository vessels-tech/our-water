import React, { Component } from 'react';
import {
  ActivityIndicator,
  Text,
  View,
  TextInput
} from 'react-native';
import { Button, Icon } from 'react-native-elements';
import PropTypes from 'prop-types';

class IconButton extends Component<Props> {

  constructor(props) {
    super(props);
  }

  updateGeoLocation() {
    this.setState({
      loading: true
    });

    return getLocation()
      .then(location => {
        // this.setState({loading: false});

        this.props.onComplete(location);
      })
      .catch(err => {
        //TODO: display error to user
        console.log('err', err);
        this.setState({ loading: false });
      });
  }

  render() {

    return (

      <View style={{
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: this.props.color,
        borderRadius: 20,
        width: 40,
        height: 40,
      }}>
        <Icon
          reverse
          raised
          size={15}
          name={this.props.name}
          onPress={() => this.props.onPress()}
          color={this.props.color}
        />
      </View>
    );
  }

}

IconButton.propTypes = {
  onPress: PropTypes.func,
  color: PropTypes.string,
  name: PropTypes.string,
  
}

export default IconButton;