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
import { bgDark2, textLight, textDark } from '../utils/Colors';
const orgId = Config.REACT_APP_ORG_ID;

export interface Props {
  onEndEditing: any,
}

export interface State {
  text: string,
  isLoading: boolean,
  results: any[]
}


export default class SearchPanel extends Component<Props> {
  state: State = {
    text: '',
    isLoading: false,
    results: [],
  };

  constructor(props: Props) {
    super(props);
  }

  performSearch(text: string) { 
    this.setState({
      isLoading: true,
      text,
    });

    //TODO: should we throttle/debounce this?
    return FirebaseApi.performBasicSearch({orgId, text})
      .then(results => {
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

    if (text.length < 3) {
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
    const list = [
      {
        title: 'Appointments',
        icon: 'av-timer'
      },
      {
        title: 'Trips',
        icon: 'flight-takeoff'
      },
    ]

    //TODO: why isn't the title showing here?
    if (results.length > 0) {
      resultsList = ( 
      <List>
        {
          list.map((item, i) => (
            <ListItem
              key={i}
              title={item.title}
              leftIcon={{name: item.icon}}
              hideChevron={true}
            >WTF?</ListItem>
          ))
        }
      </List>
      );
    }

    return (
      <View style={{
        backgroundColor: 'red',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        flexDirection: 'row',
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
            backgroundColor: 'transparent',
            borderWidth:0,
            borderTopWidth:0,
            borderBottomWidth:0,
            width: 300,
            marginHorizontal: 0,
            paddingHorizontal: 0,
            marginBottom: 0,
          }}
          inputStyle={{
            backgroundColor: 'transparent',
            color: textDark,
            // marginHorizontal: 0,
            // paddingLeft: 20,
          }}
          onChangeText={(text) => {
            if (this.state.text === text) {
              return;
            }

            this.performSearch(text);
          }}
          clearIcon={{
            color: textDark, 
            name: 'close' 
          }}
          // TODO: dismiss the keyboard as well
          onClearText={() => {
            this.setState({text:''});
            this.props.onEndEditing();
          }}
          // clearIconName
          icon={{ 
            type: 'font-awesome', 
            name: 'search',
            color: textDark,
          }}
          onEndEditing={() => this.props.onEndEditing(this.state.text)}
          placeholder='Search...' 
        />
        {this.getResults()}
      </View>
    );
  }
}
