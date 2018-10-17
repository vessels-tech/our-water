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
import { ResourceType } from '../enums';


const SCREEN_WIDTH = Dimensions.get('window').width;
const orgId = Config.REACT_APP_ORG_ID;


export interface Props {
  userId: string,
  onResourceCellPressed: any,
  //If this exists, will filter the displayed resources to be only the given resource type
  filterResourceType?: ResourceType,

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

  getFilteredResource(resources: Resource[], filterResourceType: ResourceType): Resource[] {
    return resources.filter(r => {
      if (!this.props.filterResourceType) {
        return r;
      }

      return r.resourceType === filterResourceType;
    })
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
    let favouriteResources = this.props.favouriteResources;
    const {favouriteResourcesMeta, filterResourceType } = this.props;

    if (filterResourceType) {
      favouriteResources = this.getFilteredResource(favouriteResources, filterResourceType)
    }

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
    
      //TODO: change this hint to use translations
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
        {firstFiveFavourites.map(r => this.getResourceCell(r))
        }
      </View>
    );
  }

  getRecentsSection() {
    let recentResources = this.props.recentResources;
    const { filterResourceType } = this.props;

    if (filterResourceType) {
      recentResources = this.getFilteredResource(recentResources, filterResourceType)
    }

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
        {recentResources.map(r => this.getResourceCell(r))
        }
      </View>
    );
  }

  getStartedSection() {

    return (
      <View
        style={{

          height: '100%',
          width: '100%',
          flexDirection: "column",
        }}
      >
        <View style={{
          flex: 1,
          // backgroundColor: 'tomato',
          padding: 30,
          paddingTop: 50,
        }}>
          <Text style={{ fontWeight: '500', fontSize: 18 }}>You haven't found any locations yet.</Text>
          <Text style={{ fontWeight: '200', fontSize: 18, paddingTop: 10, }}>Press the QR scanner or search for a resource to find a location.</Text>
        </View>

        <View style={{
          // backgroundColor: 'purple',
          flexDirection: 'row',
          flex: 2,
          justifyContent: 'space-around',
        }}>
          <Button 
            style={{
              flex: 1
            }}
            onPress={() => console.log("on Camera pressed")} 
            title="SCAN"
          />
          <Button 
            style={{
              flex: 1
            }}
            onPress={() => console.log("on search pressed")} 
            title="SEARCH"
          />
        </View>
      </View>
    );
  }

  getResourcesSection() {
    return (
      <View>
        <Text style={{
          marginVertical: 10,
          marginLeft: 13,
        }}>
          Favourites
        </Text>
        {this.getFavouritesSection()}
        <Text style = {{
          marginVertical: 10,
          marginLeft: 13,
        }}>
          Recents:
        </Text >
        {this.getRecentsSection()}
      </View>
    )
  }

  render() {
    let recentResources = this.props.recentResources;
    let favouriteResources = this.props.favouriteResources;
    const { filterResourceType } = this.props;

    if (filterResourceType) {
      favouriteResources = this.getFilteredResource(favouriteResources, filterResourceType)
    }

    if (filterResourceType) {
      recentResources = this.getFilteredResource(recentResources, filterResourceType)
    }



    return (
      <View style={{
        backgroundColor: bgLightHighlight,
        flex: 5,
        // flexDirection: 
        }}>
        {favouriteResources.length + recentResources.length === 0 ? 
          this.getStartedSection() : this.getResourcesSection()}
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