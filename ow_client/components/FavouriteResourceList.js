import React, { Component } from 'react';
import {
  Text,
  View,
  TextInput
} from 'react-native';
import PropTypes from 'prop-types';


/**
 * FavouriteResourceList displays a list of the recent or favourite
 * resources.
 * 
 */
class FavouriteResourceList extends Component<Props> {

  

  render() {
    return (
      <View style={{
        backgroundColor: '#D9E3F0',
        justifyContent: 'center',
        alignItems: 'center',
        flex: 5,
      }}>
        <Text>Recents</Text>
      </View>
    );
  }
};

FavouriteResourceList.propTypes = {
  favourites: PropTypes.array.isRequired,
  recents: PropTypes.array.isRequired,
  newReadingPressed: PropTypes.func.isRequired,
  favouriteToggled: PropTypes.func.isRequired
};


export default SearchBar;