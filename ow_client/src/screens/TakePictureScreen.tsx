'use strict';
import * as React from 'react'; import { Component } from 'react';
import {
  AppRegistry,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
  PermissionsAndroid,
  TouchableNativeFeedback
} from 'react-native';
import { RNCamera } from 'react-native-camera';
import { bgLight } from '../utils/Colors';
import Loading from '../components/common/Loading';

export interface Props {
  onTakePicture: (dataUri: string) => void,
  onTakePictureError: (message: string) => void,
}


export interface State {
  loading: boolean
}

export default class TakePictureScreen extends React.PureComponent<Props> {
  camera: any;
  state: State;

  constructor(props: Props) {
    super(props);

    this.state = {
      loading: false,
    }

    //Binds
    this.takePicture = this.takePicture.bind(this);
  }

  render() {
    return (
      <View style={{
        flex: 1,
        flexDirection: 'column',
        height: '100%',
        backgroundColor: bgLight
      }}>
        <RNCamera
          ref={ref => {
            this.camera = ref;
          }}
          style={{
            flex: 5,
            justifyContent: 'flex-end',
            alignItems: 'center'
          }}
          type={RNCamera.Constants.Type.back}
          flashMode={RNCamera.Constants.FlashMode.off}
          permissionDialogTitle={'Permission to use camera'}
          permissionDialogMessage={'We need your permission to use your camera phone'}
        />
        <TouchableNativeFeedback
          onPress={this.takePicture}
          style={{
            flex: 1,
          }}
        >
          <View style={{
            justifyContent: 'center',
            flex: 1,
           }}>   
            { this.state.loading ?  
              <Loading/> :
              <Text style={{
                alignSelf: 'center',
                textAlign: "center",
                fontSize: 22,
                fontWeight: '700' 
              }}> SNAP </Text>
            }
          </View>
        </TouchableNativeFeedback>
      </View>
    );
  }

  takePicture = async function () {
    if (this.state.loading) {
      return;
    }

    this.setState({loading: true}, async () => {
      if (this.camera) {
        const options = { 
          quality: 0.1, 
          base64: true,
          fixOrientation: true,
        };
        try {
          const data = await this.camera.takePictureAsync(options)
          return this.props.onTakePicture(data.base64);
        } catch (err) {
          return this.props.onTakePictureError(err);
        }
      }
      this.props.onTakePictureError('Camera was not initalized');
    });
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'black'
  },
  preview: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center'
  },
});