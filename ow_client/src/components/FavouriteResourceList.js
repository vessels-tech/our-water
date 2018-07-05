import React, { Component } from 'react';
import {
  Text,
  View,
  TextInput,
  Image,
  Dimensions,
} from 'react-native';
import { Card, ListItem, Button } from 'react-native-elements'
import Icon from 'react-native-vector-icons/FontAwesome';


import PropTypes from 'prop-types';
import FirebaseApi from '../api/FirebaseApi';
import { randomPrettyColorForId, getShortId } from '../utils';

import Config from 'react-native-config'

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;
const orgId = Config.REACT_APP_ORG_ID;


/**
 * FavouriteResourceList displays a list of the recent or favourite
 * resources.
 * 
 */
class FavouriteResourceList extends Component<Props> {

  constructor(props) {
    super(props);

    this.state = {
      favourites: {},
      recents: []
    }
  }

  componentWillMount() {
    const { userId } = this.props;

    // Subscribe to updates
    this.unsubscribe = FirebaseApi.listenForUpdatedUser({orgId, userId}, this.onUserUpdated);
  
    return Promise.all([
      FirebaseApi.getRecentResources({orgId, userId}),
      FirebaseApi.getFavouriteResources({orgId, userId})
    ])
    .then(([recents, favourites]) => {
      console.log('recents,', recents, 'favourites', favourites);
      this.setState({
        recents, 
        favourites,
      });
    });
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  //TODO: for some reason, this isn't updating
  onUserUpdated(sn) {
    console.log("onUserUpdated snapshot", sn);

  }

  getResourceCell(resource) {
    //Ideally, we would display the resource image + 
    //if we don't have the image, pick a random color from a nice set maybe?
    const backgroundColor = randomPrettyColorForId(resource.id);

    return (
      <View style={{
          margin: 0,
          marginBottom: 15,
          width: SCREEN_WIDTH / 2,
        }}
        key={resource.id}
      >
        <Button
          key={resource.id}
          title={getShortId(resource.id)}
          buttonStyle={{
            backgroundColor, 
            borderRadius: 5 
          }}
          titleStyle={{ fontWeight: 'bold', fontSize: 23 }}
          containerStyle={{ 
 
          }}
          onPress={() => this.props.onResourceCellPressed(resource)}
          underlayColor="transparent"
        />
      </View>
    );
  }

  
  getFavouritesSection() {
    const { favourites } = this.state;

    if (Object.keys(favourites).length === 0) {

      const icon = (<Icon
        style={{
          // backgroundColor: 'blue',
          flex: 1,
        }}
        // reverse
        raised
        size={12}
        name='star'
        color='yellow'
      />);
      

      return (
        <Text style={{textAlign: 'center'}}>
          Press the {icon} button to add a favourite.
        </Text>
      );
    }

    const firstFiveFavourites = Object.keys(favourites)
      .slice(0, 5)
      .map(id => favourites[id]);

    return (
      <View style={{
        flexWrap: 'wrap',
        flexDirection: 'row',
      }}
      >
        {firstFiveFavourites.map(resource => this.getResourceCell(resource))}
      </View>
    );
  }

  getRecentsSection() {
    const { recents } = this.state;

    if (recents.length === 0) {
      return (
        <View style={{
          height: 150,
          marginTop: 30,
          marginHorizontal: 100,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <Text style={{ textAlign: 'center' }}>
            No recent resources.
          </Text>
        </View>
      );
    }

    return (
      <View style={{
        flexWrap: 'wrap',
        flexDirection: 'row',
      }}
      > 
        { recents.map(resource => this.getResourceCell(resource))}
      </View>
    );
  }

  render() {

    return (
      <View style={{
          backgroundColor: '#D9E3F0',
          justifyContent: 'center',
          alignItems: 'center',
          flex: 5,
        }}>
        <Text style={{
          marginVertical: 10,
        }}>
          Favourites
        </Text>
        {this.getFavouritesSection()}
        <Text style={{
          marginVertical: 10,
        }}>Recents:</Text>
        {this.getRecentsSection()}
      </View>
    );
  }

}

FavouriteResourceList.propTypes = {
  onResourceCellPressed: PropTypes.func.isRequired,
  userId: PropTypes.string.isRequired,
};


export default FavouriteResourceList;