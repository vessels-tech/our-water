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
import { 
  List, 
  ListItem, 
  FormInput, 
  SearchBar as SB 
} from 'react-native-elements';

import Loading from './Loading';
import FirebaseApi from '../api/FirebaseApi';

import Config from 'react-native-config'
const orgId = Config.REACT_APP_ORG_ID;


class SearchPanel extends Component<Props> {

  constructor(props) {
    super(props);

    this.state = {
      text: '',
      isLoading: false,
      results: [],
    };
  }

  performSearch(text) { 
    this.setState({
      isLoading: true,
      text,
    });

    //TODO: should we throttle this?
    return FirebaseApi.performBasicSearch({orgId, text})
      .then(results => {
        console.log("search finished", results);
        this.setState({
          isLoading: false,
          results
        });
      })
      .catch(err => {
        console.log('search err', err);
        this.setState({isLoading: false});
      });
  }

  getResults() {
    const { text, isLoading, results } = this.state;

    console.log('text', text);

    if (text === '') {
      return null;
    }


    let resultsList = (
      <Text style={{marginVertical: 20}}>
        No Results Found
      </Text>
    );
    
    if (isLoading) {
      resultsList = <Loading/>;
    }

    if (results.length > 0) {
      resultsList = (
        <Text style={{ marginBottom: 20 }}>
          Results:
          {/* TODO: re enable - not sure why this is broken */}
          {/* <List containerStyle={{ marginBottom: 20 }}>
            {
              results.map((r, i) => (
                <ListItem
                  key={i}
                  title={r.id}
                />
              ))
            }
          </List> */}
        </Text> 
      );
    }

    return (
      <View style={{
        backgroundColor: '#D9E3F0',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        {resultsList}
      </View>
    );
  }

  render() {
    const { text } = this.state;

    let backgroundColor = 'transparent';
    if (text !== '') {
      backgroundColor = "#D9E3F0";
    }

    return (
      <View style={{
        flexDirection: 'column',
      }}>
        <SB
          lightTheme
          containerStyle={{ 
            backgroundColor: backgroundColor,
            borderWidth:0,
            borderTopWidth:0,
            borderBottomWidth:0,
            width: '100%',
            marginHorizontal: 0,
            paddingHorizontal: 0,
            marginBottom: 0,
          }}
          inputStyle={{
            // marginHorizontal: 0,
            // paddingLeft: 20,
          }}
          onChangeText={(text) => {
            this.performSearch(text);
          }}
          onClearText={() => this.setState({text:''})}
          icon={{ type: 'font-awesome', name: 'search' }}
          onEndEditing={() => this.props.onEndEditing(this.state.text)}
          placeholder='Search...' 
        />
        {this.getResults()}
      </View>
    );
  }
}

SearchPanel.propTypes = {
  onEndEditing: PropTypes.func.isRequired,
}

export default SearchPanel;