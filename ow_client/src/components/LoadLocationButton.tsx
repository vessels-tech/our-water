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

export interface Props { 
  onComplete: any,
}

export interface State {
  loading: boolean,
}

export default class LoadLocationButton extends Component<Props> {
  state: State = {
    loading: false,
  }

  constructor(props: Props) {
    super(props);

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
