import React, { Component } from 'react';
import {
  Text,
  View,
  Dimensions,
} from 'react-native';
import {  Button } from 'react-native-elements'
import Icon from 'react-native-vector-icons/FontAwesome';

import FirebaseApi from '../api/FirebaseApi';
import { randomPrettyColorForId, getShortId } from '../utils';

import Config from 'react-native-config'
import { textDark } from '../utils/Colors';

const SCREEN_WIDTH = Dimensions.get('window').width;
const orgId = Config.REACT_APP_ORG_ID;


export interface Props {
  userId: string,
  onResourceCellPressed: any
}

export interface State {
  favourites: any,
  recents: any[],
}

/**
 * FavouriteResourceList displays a list of the recent or favourite
 * resources.
 * 
 */
export default class FavouriteResourceList extends Component<Props> {
  unsubscribe: any;
  state: State;

  constructor(props: Props) {
    super(props);

    this.state = {
      favourites: {},
      recents: []
    }
  }

  componentWillMount() {
    const { userId } = this.props;

    // Subscribe to updates
    this.unsubscribe = FirebaseApi.listenForUpdatedUser(orgId, userId, this.onUserUpdated);
  
    return Promise.all([
      FirebaseApi.getRecentResources(orgId, userId),
      FirebaseApi.getFavouriteResources(orgId, userId)
    ])
    .then(([recents, favourites]) => {
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
  onUserUpdated(sn: any) {
    console.log("onUserUpdated snapshot", sn);

  }

  getResourceCell(resource: any) {
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
          raised
          key={resource.id}
          title={`${getShortId(resource.id)}`}
          color={textDark}
          buttonStyle={{
            backgroundColor, 
            // borderRadius: 5,
          }}
          // titleStyle={{
          //   fontWeight: 'bold', 
          //   fontSize: 23,
          // }}
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
          flex: 1,
        }}
        //@ts-ignore
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
          // backgroundColor: '#D9E3F0',
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