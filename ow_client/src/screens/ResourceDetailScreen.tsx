import React, { Component } from 'react';
import {
  WebView,
} from 'react-native';

export interface Props {
  legacyId: string,
}

export interface State {

}

class ResourceDetailScreen extends Component<Props> {

  getWebView() {
    const { legacyId } = this.props;
    // eg. http://mywell.vessels.tech/#/tab/map/313603/1136
    const uri = `http://mywell.vessels.tech/#/tab/map/${legacyId.replace('.', '/')}`;
    console.log('loading webview', uri);

    return (
      <WebView
        style={{ 
        }}
        source={{ uri }}
        scalesPageToFit={true} 
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
      />  
    );
  }

  render() {
    return this.getWebView();
  }
}

export default ResourceDetailScreen;