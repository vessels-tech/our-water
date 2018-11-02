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
import { DeprecatedResource } from '../typings/models/OurWater';
import Loading from './common/Loading';
import { AppState } from '../reducers';
import { connect } from 'react-redux'
import { SyncMeta } from '../typings/Reducer';
import { ResourceType } from '../enums';
import { ConfigFactory } from '../config/ConfigFactory';
import { TranslationFile } from 'ow_translations/Types';
import ResourceCell from './common/ResourceCell';


const SCREEN_WIDTH = Dimensions.get('window').width;
const orgId = Config.REACT_APP_ORG_ID;


export interface Props {
  userId: string,
  config: ConfigFactory,
  onResourceCellPressed: any,
  //If this exists, will filter the displayed resources to be only the given resource type
  filterResourceType?: ResourceType,

  favouriteResourcesMeta: SyncMeta,
  favouriteResources: DeprecatedResource[],
  recentResourcesMeta: SyncMeta,
  recentResources: DeprecatedResource[],
  translation: TranslationFile,
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

  getFilteredResource(resources: DeprecatedResource[], filterResourceType: ResourceType): DeprecatedResource[] {
    return resources.filter(r => {
      if (!this.props.filterResourceType) {
        return r;
      }

      return r.resourceType === filterResourceType;
    })
  }

  
  getResourceCell(resource: DeprecatedResource) {
    //Ideally, we would display the resource image + 
    //if we don't have the image, pick a random color from a nice set maybe?
    const backgroundColor = randomPrettyColorForId(resource.id);

    //If we don't have a shortId, display a blurred short version of the existing Id.

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
    const { 
      favouriteResourcesMeta, 
      filterResourceType, 
      translation: { templates: { favourite_resource_hint_1, favourite_resource_hint_2 } } } = this.props;

    let favouriteResources = this.props.favouriteResources;

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
          {favourite_resource_hint_1} {icon} {favourite_resource_hint_2}.
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
        {firstFiveFavourites.map(r => (
          <ResourceCell 
            key={r.id}
            config={this.props.config} 
            resource={r} 
            onResourceCellPressed={(resource) => this.props.onResourceCellPressed(resource)}
          />
        ))
        }
      </View>
    );
  }

  getRecentsSection() {
    const { translation: { templates: { recent_resource_none } } } = this.props;
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
            {recent_resource_none}
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
        {recentResources.map(r => (
          <ResourceCell
            key={r.id}
            config={this.props.config}
            resource={r}
            onResourceCellPressed={(resource) => this.props.onResourceCellPressed(resource)}
          />
        ))
        }
      </View>
    );
  }

  getStartedSection() {
    const { translation: { templates: { resource_detail_empty_heading, resource_detail_empty_hint}}} = this.props;

    const shouldShowButtons = this.props.config.getFavouriteResourceShouldShowGetStartedButtons();

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
          padding: 30,
          paddingTop: 50,
        }}>
          <Text style={{ fontWeight: '500', fontSize: 18 }}>{resource_detail_empty_heading}</Text>
          <Text style={{ fontWeight: '200', fontSize: 18, paddingTop: 10, }}>{resource_detail_empty_hint}</Text>
        </View>
        { shouldShowButtons ? 
        <View style={{
          flexDirection: 'row',
          flex: 2,
          justifyContent: 'space-around',
        }}>
        {/* TODO: replace with icons */}
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
        : null }
      </View>
    );
  }

  getResourcesSection() {
    const { translation: { templates: { favourite_resource_heading, recent_resource_heading}}} = this.props;

    return (
      <View>
        <Text style={{
          marginVertical: 10,
          marginLeft: 13,
        }}>
          {favourite_resource_heading}:
        </Text>
        {this.getFavouritesSection()}
        <Text style = {{
          marginVertical: 10,
          marginLeft: 13,
        }}>
          {recent_resource_heading}:
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
    translation: state.translation,
  }
}

const mapDispatchToProps = (dispatch: any) => {
  return {
   
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(FavouriteResourceList);