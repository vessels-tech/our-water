import * as React from 'react'; import { Component } from 'react';
import {
  View, ActivityIndicator,
} from 'react-native';
import { Icon } from 'react-native-elements';
import { primary, textDark } from '../../utils/Colors';
import { getLocation } from '../../utils';
import Loading from './Loading';

export interface Props {
  onComplete?: any,
  onPress: any,
  color: string,
  name: string,
  isLoading: boolean,
}

export interface State {

}

export default class FlatIconButton extends Component<Props> {

  constructor(props: Props) {
    super(props);
  }

  render() {
    const { isLoading } = this.props;
    console.log("rendering FlatIconButton");
    return (
      <View style={{
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        { isLoading ? 
          <ActivityIndicator
            size="small"
            color={this.props.color}
            animating={true}
          />
          :
          <Icon
            size={25}
            name={this.props.name}
            onPress={() => this.props.onPress()}
            // color={this.props.color ? this.props.color : primary}
            iconStyle={{
              color: this.props.color,
            }}
          />
          }
      </View>
    );
  }
}
