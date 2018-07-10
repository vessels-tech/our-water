import React, { Component } from 'react';
import {
  ActivityIndicator,
  Text,
  View,
  TextInput
} from 'react-native';
import { Button, Icon } from 'react-native-elements';
import PropTypes from 'prop-types';
import { primary, textDark } from '../utils/Colors';

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
        borderRadius: 50,
        width: 45,
        height: 45,
      }}>
        <Icon
          reverse
          raised
          size={20}
          name={this.props.name}
          onPress={() => this.props.onPress()}
          color={this.props.color ? this.props.color : primary}
          iconStyle={{
            color: textDark,
          }}
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