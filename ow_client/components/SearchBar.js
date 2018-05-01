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


class SearchBar extends Component<Props> {

  constructor(props) {
    super(props);

    this.state = {
      text: ''
    };
  }

  render() {

    return (
      <View
        style={{flexDirection:'row', width:'100%', flex:1}}
      >
        <TextInput
          style={{flex:1, borderColor: 'gray', borderWidth: 1 }}
          onChangeText={(text) => this.setState({ text })}
          onEndEditing={() => this.props.onEndEditing(this.state.text)}
          value={this.state.text}
          placeholder='Search'
        />
      </View>
    );
  }
}

SearchBar.propTypes = {
  onEndEditing: PropTypes.func.isRequired,
}

export default SearchBar;