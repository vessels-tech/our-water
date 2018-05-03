import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  ScrollView,
  Text,
  View,
  TextInput
} from 'react-native';
import PropTypes from 'prop-types';
import Icon from 'react-native-vector-icons/FontAwesome';
import { FormInput, SearchBar as SB } from 'react-native-elements';

class NewReadingScreen extends Component<Props> {

  render() {
    return (
      <View style={{
        flex: 1,
        // flexDirection: 'vertical',
        backgroundColor: '#D9E3F0',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <Text>New Reading View</Text>
      </View>
    );
  }
}

// NewReadingScreen.propTypes = {

// }

export default NewReadingScreen;