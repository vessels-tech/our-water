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



class SearchBar extends Component<Props> {

  constructor(props) {
    super(props);

    this.state = {
      text: ''
    };
  }

  render() {
    // {/* <TextInput
    //   style={{flex:1, borderColor: 'gray', borderWidth: 1 }}
    //   onChangeText={(text) => this.setState({ text })}
    //   onEndEditing={() => this.props.onEndEditing(this.state.text)}
    //   value={this.state.text}
    //   placeholder='Search'
    // /> */}

    return (
        <SB
          lightTheme
          containerStyle={{ 
            backgroundColor: 'transparent',
            borderWidth:0,
            borderTopWidth:0,
            borderBottomWidth:0,
            width: '100%',
          }}
          onChangeText={(text) => this.setState({ text })}
          onClearText={() => this.setState({text:''})}
          icon={{ type: 'font-awesome', name: 'search' }}
          onEndEditing={() => this.props.onEndEditing(this.state.text)}
          placeholder='Search...' />
    );
  }
}

SearchBar.propTypes = {
  onEndEditing: PropTypes.func.isRequired,
}

export default SearchBar;