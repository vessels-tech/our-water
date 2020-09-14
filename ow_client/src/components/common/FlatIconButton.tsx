import * as React from 'react'; import { Component } from 'react';
import {
  View, ActivityIndicator,
} from 'react-native';
import { Icon } from 'react-native-elements';
import { getLocation } from '../../utils';
import Loading from './Loading';

import withPreventDoubleClick from './withPreventDoubleClick';
import { getOrElse } from 'ow_common/lib/utils';
const IconEx = withPreventDoubleClick(Icon);

export interface Props {
  onComplete?: any,
  onPress: any,
  color: string,
  name: string,
  isLoading: boolean,
  style?: any,
  size?: number
}

export interface State {

}

export default class FlatIconButton extends Component<Props> {

  constructor(props: Props) {
    super(props);

  }

  render() {
    const { isLoading } = this.props;
    let size = this.props.size;
    if (!size) {
      size = 25;
    }

    return (
      <View style={{
        justifyContent: 'center',
        alignItems: 'center',
        ...this.props.style,
      }}>
        { isLoading ? 
          <ActivityIndicator
            size="small"
            color={this.props.color}
            animating={true}
          />
          :
          <IconEx
            size={size}
            name={this.props.name}
            onPress={() => this.props.onPress()}
            iconStyle={{
              color: this.props.color,
            }}
          />
          }
      </View>
    );
  }
}
