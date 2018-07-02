import React, { Component } from 'react';
import {
  // Platform,
  // StyleSheet,
  // ScrollView,
  View,
  // TextInput,
  // WebView,
} from 'react-native';
import {
  Button,
  Icon,
  Text,
} from 'react-native-elements';
import PropTypes from 'prop-types';

class SettingsScreen extends Component<Props> {


  render() {
    return (
      // TODO: display conditionally, use firebase remote config
      <View style={{
        flexDirection: 'column',
        marginTop: 20,
      }}>
        <Button
          buttonStyle={{
            backgroundColor: '#FF6767',
            borderRadius: 5,
            flex: 1,
            padding: 20,
            marginBottom: 20
          }}
          titleStyle={{ fontWeight: 'bold', fontSize: 23 }}
          title='Connect to GGMN'
          onPress={() => console.log("GGMN pressed")}
        />
        <Button
      
          buttonStyle={{
            backgroundColor: '#FF6767',
            borderRadius: 5,
            flex: 1,
            padding: 20,
            marginBottom: 20
          }}
          titleStyle={{ fontWeight: 'bold', fontSize: 23 }}
          title='Register a new Resource'
          onPress={() => console.log("register pressed")}
        />
        <Button
          style={{
            marginBottom: 20          
          }}
          buttonStyle={{
            backgroundColor: '#FF6767',
            borderRadius: 5,
            flex: 1,
            padding: 20,
            marginBottom: 20
          }}
          titleStyle={{ fontWeight: 'bold', fontSize: 23 }}
          title='Language'
          onPress={() => console.log("language pressed")}
        />
      </View>
    );
  }
}

export default SettingsScreen;