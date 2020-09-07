'use strict';
import * as React from 'react';
import {
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
  onTakePicture: (dataUri: string, fileUrl: string) => void,
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
    if (this.state.loading || !this.camera) {
      return;
    }
    this.setState({loading: true}, async () => {
      if (this.camera) {
        const options = {
          quality: 0.25,
          base64: true,
          fixOrientation: true,
          width: 500
        };
        try {
          const data = await this.camera.takePictureAsync(options);
          this.camera.pausePreview(); //must be after takePictureAsync
          this.setState({image: data.base64});
          return this.props.onTakePicture(data.base64, data.uri);
        } catch (err) {
          console.log('failed')
          console.log(err)
          return this.props.onTakePictureError(err);
        }
      }

      this.props.onTakePictureError('Camera was not initalized');
    });
  };
}
