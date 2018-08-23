import React, { Component } from 'react';
import {
  View,
} from 'react-native';
import { Icon } from 'react-native-elements';
import { primary, textDark } from '../utils/Colors';
import { getLocation } from '../utils';

export interface Props {
  onComplete?: any,
  onPress: any,
  color?: string,
  name: string,
}

export interface State {

}

export default class IconButton extends Component<Props> {

  constructor(props: Props) {
    super(props);
  }

  updateGeoLocation() {
    this.setState({
      loading: true
    });

    return getLocation()
    .then(location => {
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
