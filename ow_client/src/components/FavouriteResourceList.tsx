import * as React from 'react'; import { Component } from 'react';
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
import { bgLightHighlight, primaryText, secondaryText } from '../utils/Colors';
import { Resource } from '../typings/models/OurWater';
import Loading from './common/Loading';
import { AppState } from '../reducers';
import { connect } from 'react-redux'
import { SyncMeta } from '../typings/Reducer';


const SCREEN_WIDTH = Dimensions.get('window').width;
const orgId = Config.REACT_APP_ORG_ID;


export interface Props {
  userId: string,
  onResourceCellPressed: any

  favouriteResourcesMeta: SyncMeta,
  favouriteResources: Resource[],
  recentResourcesMeta: SyncMeta,
  recentResources: Resource[],
}

export interface State {
  recents: any[],
}

/**
 * FavouriteResourceList displays a list of the recent or favourite
 * resources.
 * 
 */
class FavouriteResourceList extends Component<Props> {
  unsubscribe: any;
  state: State;

  constructor(props: Props) {
    super(props);

    this.state = {
      // favourites: {},
      recents: []
    }
  }

  
  getResourceCell(resource: Resource) {
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
          color={secondaryText}
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
    const { favouriteResources, favouriteResourcesMeta } = this.props;

    if (favouriteResourcesMeta.loading) {
      return <Loading/>
    }

    if (favouriteResources.length === 0) {
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

    const firstFiveFavourites = favouriteResources.slice(0,5);
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
    const { recentResources } = this.props;

    if (recentResources.length === 0) {
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
        {recentResources.map(r => this.getResourceCell(r))}
      </View>
    );
  }

  render() {

    return (
      <View style={{
        backgroundColor: bgLightHighlight,
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

const mapStateToProps = (state: AppState) => {

  return {
    favouriteResourcesMeta: state.favouriteResourcesMeta,
    favouriteResources: state.favouriteResources,
    recentResourcesMeta: state.recentResourcesMeta,
    recentResources: state.recentResources,
  }
}

const mapDispatchToProps = (dispatch: any) => {
  return {
   
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(FavouriteResourceList);