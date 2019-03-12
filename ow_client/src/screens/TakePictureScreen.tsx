'use strict';
import * as React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableNativeFeedback,
  Image
} from 'react-native';
import { Icon } from 'react-native-elements';
import { RNCamera } from 'react-native-camera';
import { bgLight } from '../utils/Colors';
import Loading from '../components/common/Loading';
import { renderLog } from '../utils';
import { secondaryText } from '../utils/NewColors';
import { isNullOrUndefined } from 'util';

export interface Props {
  onTakePicture: (dataUri: string) => void,
  onTakePictureError: (message: string) => void,
}

export interface State {
  loading: boolean,
  imageBase64: null | string,
}

export default class TakePictureScreen extends React.PureComponent<Props> {
  camera: any;
  state: State;

  constructor(props: Props) {
    super(props);

    this.state = {
      loading: false,
      imageBase64: null,
    }

    //Binds
    this.takePicture = this.takePicture.bind(this);
  }

  render() {
    console.log("rendering TakePictureScreen");

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
          captureAudio={false}
          type={RNCamera.Constants.Type.back}
          flashMode={RNCamera.Constants.FlashMode.off}
          permissionDialogTitle={'Permission to use camera'}
          permissionDialogMessage={'We need your permission to use your camera phone'}
          
        /> 
        <TouchableNativeFeedback
          onPress={this.takePicture}
          style={{ flex: 1, }}
        >
          <View style={{
            justifyContent: 'center',
            flex: 1,
           }}>   
            <Icon
              containerStyle={{
                flex: 1,
              }}
              size={40}
              name={'camera'}
              color={secondaryText.high}
              iconStyle={{
                color: secondaryText.high,
              }}
            />
          </View>
        </TouchableNativeFeedback>
      </View>
    );
  }

  takePicture = async function () {
    if (this.state.loading) {
      return;
    }

    this.camera.pausePreview();

    this.setState({loading: true}, async () => {
      if (this.camera) {
        const options = { 
          quality: 0.5, 
          base64: true,
          fixOrientation: true,
        };
        try {
          const data = await this.camera.takePictureAsync(options)
          this.setState({image: data.base64});
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