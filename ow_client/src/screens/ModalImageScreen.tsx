'use strict';
import * as React from 'react';
import {
  View,
  Image,
  Dimensions
} from 'react-native';
import { bgLight } from '../utils/Colors';
const SCREEN_WIDTH = Dimensions.get('window').width;


export interface Props {
  imageUrl: string,

}

export interface State {
  loading: boolean,
}

export default class ModalImageScreen extends React.PureComponent<Props> {
  camera: any;
  state: State;

  constructor(props: Props) {
    super(props);

    this.state = {
      loading: false,
    }
  }

  render() {
    return (
      <View style={{
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        backgroundColor: bgLight,
      }}>
        <Image 
          style={{ 
            height: 200,
            left: 0,
            right: 0,
          }}
          resizeMode="contain"
          source={{uri: this.props.imageUrl}}
        />
      </View>
    );
  }
}