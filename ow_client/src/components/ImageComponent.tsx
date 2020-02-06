import * as React from "react";
import { Component } from "react";
import { View, Image } from "react-native";
import { Button } from "react-native-elements";

import { showModal, maybeLog, dismissModal } from "../utils";
import { primary, primaryDark } from "../utils/Colors";
import { AppState } from "../reducers";
import { connect } from "react-redux";
import IconButton from "./common/IconButton";

export interface IImage {
  type: ImageType;
  url: string;
}

export enum ImageType {
  NONE = "NONE",
  IMAGE = "IMAGE"
}

export interface OwnProps {
  image: IImage;
  onImageUpdated: (newImage: IImage) => void;
}

export interface StateProps {}

export interface ActionProps {}

export interface State {
  image: IImage | null;
}

type Props = OwnProps;

class ImageComponent extends Component<Props> {
  private id: string;

  constructor(props: Props) {
    super(props);

    this.showTakePictureScreen = this.showTakePictureScreen.bind(this);
    this.onTakePicture = this.onTakePicture.bind(this);
    this.onTakePictureError = this.onTakePictureError.bind(this);
    this.clearImage = this.clearImage.bind(this);
    this.state = {
      image: this.props.image || { type: ImageType.NONE, url: '' }
    };
    this.id = String(Math.random());
  }

  showTakePictureScreen() {
    console.log("show modal");
    showModal(this.props, "modal.TakePictureScreen", "Take Picture", {
      onTakePicture: (data: string) => this.onTakePicture(data),
      onTakePictureError: (data: string) => this.onTakePictureError
    }, this.id);
  }

  clearImage() {
    this.setState({
      image: {
        type: ImageType.NONE,
        url: ''
      }
    });
  }

  onTakePicture(dataUri: string) {
    dismissModal(this.id);
    const newImage: IImage = {
      type: ImageType.IMAGE,
      url: dataUri
    };

    this.setState({
      image: newImage
    });

    this.props.onImageUpdated(newImage);
  }

  onTakePictureError(message: string) {
    console.log("error");
    maybeLog("Error taking picture", message);
    dismissModal(this.id);
  }

  render() {
    const image = (this.state as any).image;

    return (
      <View
        style={{
          height: 300,
          backgroundColor: primaryDark,
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        {image.type === ImageType.NONE ? (
          <Button
            title="Add an Image"
            raised={true}
            icon={{ name: "camera" }}
            buttonStyle={{
              backgroundColor: primary
            }}
            onPress={this.showTakePictureScreen}
            underlayColor="transparent"
          />
        ) : null}
        {image.type === ImageType.IMAGE ? (
          <View
            style={{
              backgroundColor: primaryDark,
              flex: 1,
              width: "100%",
              height: 300
            }}
          >
            <View
              style={{
                position: "absolute",
                zIndex: 10,
                right: 10,
                top: 10
              }}
            >
              <IconButton name={"close"} onPress={this.clearImage} />
            </View>
            <Image
              style={{
                width: "100%",
                height: 300
              }}
              source={{ uri: `data:image/png;base64,${image.url}` }}
            />
          </View>
        ) : null}
      </View>
    );
  }
}

//If we don't have a user id, we should load a different app I think.
const mapStateToProps = (state: AppState, ownProps: OwnProps): StateProps => {
  return {};
};

const mapDispatchToProps = (dispatch: any) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(ImageComponent);
