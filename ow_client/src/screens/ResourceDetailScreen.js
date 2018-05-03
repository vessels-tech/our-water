import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  ScrollView,
  Text,
  View,
  TextInput,
  WebView,
} from 'react-native';
import PropTypes from 'prop-types';
import Icon from 'react-native-vector-icons/FontAwesome';
import { FormInput, SearchBar as SB } from 'react-native-elements';

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

ResourceDetailScreen.propTypes = {
  legacyId: PropTypes.string.isRequired,
}

export default ResourceDetailScreen;