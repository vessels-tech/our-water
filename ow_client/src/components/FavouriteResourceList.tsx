import * as React from 'react'; import { Component } from 'react';
import {
  Text,
  View,
  Dimensions,
  ScrollView,
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
import { ResourceType, ScrollDirection } from '../enums';
import { ConfigFactory } from '../config/ConfigFactory';
import { TranslationFile } from 'ow_translations';
import ResourceCell from './common/ResourceCell';
import { AnyResource } from '../typings/models/Resource';
import { OrgType } from '../typings/models/OrgType';
import DownArrow from './common/DownArrow';

const SCREEN_WIDTH = Dimensions.get('window').width;


export interface Props {
  userId: string,
  config: ConfigFactory,
  onResourceCellPressed: any,
  //If this exists, will filter the displayed resources to be only the given resource type
  filterResourceType?: ResourceType,

  favouriteResourcesMeta: SyncMeta,
  favouriteResources: AnyResource[],
  recentResourcesMeta: SyncMeta,
  recentResources: AnyResource[],
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

    /* binds */
    // this.props.onResourceCellPressed = this.props.onResourceCellPressed.bind(this)
  }

  getFilteredResource(resources: AnyResource[], filterResourceType: ResourceType): AnyResource[] {
    return resources.filter(r => {
      if (!this.props.filterResourceType || r.type !== OrgType.MYWELL) {
        return r;
      }

      return r.resourceType === filterResourceType;
    })
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
      const icon = (
        <Icon
          style={{
            flex: 1,
          }}
          //@ts-ignore
          raised={true}
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
    if (this.props.config.getFavouriteResourceScrollDirection() === ScrollDirection.Vertical) {
      return (
        <View style={{
          flexWrap: 'wrap',
          flexDirection: 'row',
        }}
        >
          {firstFiveFavourites.map((r) => (
            <ResourceCell 
              style={{marginBottom: 15}}
              key={r.id}
              config={this.props.config} 
              resource={r} 
              onResourceCellPressed={this.props.onResourceCellPressed}
            />
          ))
          }
        </View>
      );
    }

    return (
      <ScrollView 
        style={{ flex: 1 }}
        showsHorizontalScrollIndicator={false}
        horizontal={true}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        {firstFiveFavourites.map((r) => (
          <ResourceCell
            style={{flex: 1}}
            key={r.id}
            config={this.props.config}
            resource={r}
            onResourceCellPressed={this.props.onResourceCellPressed}
          />
        ))
        }
      </ScrollView>
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

    if (this.props.config.getFavouriteResourceScrollDirection() === ScrollDirection.Vertical) {
      return (
        <View style={{
          flexWrap: 'wrap',
          flexDirection: 'row',
        }}
        > 
          {recentResources.map((r) => { 
            return (
              <ResourceCell
                style={{ marginBottom: 15 }}
                key={r.id}
                config={this.props.config}
                resource={r}
                onResourceCellPressed={this.props.onResourceCellPressed}
              />
          )})
          }
        </View>
      );
    }

    return (
      <ScrollView
        horizontal={true}
        showsHorizontalScrollIndicator={false}
      >
        {recentResources.map((r) => {
          return (
            <ResourceCell
              style={{}}
              key={r.id}
              config={this.props.config}
              resource={r}
              onResourceCellPressed={this.props.onResourceCellPressed}
            />
          )})
        }
      </ScrollView>
    );
  }

  getStartedSection() {
    const { translation: { templates: { resource_detail_empty_heading, resource_detail_empty_hint}}} = this.props;

    const shouldShowButtons = this.props.config.getFavouriteResourceShouldShowGetStartedButtons();

    const SCREEN_WIDTH = Dimensions.get('window').width;

    return (
      <View
        style={{
          flex: 1,
          flexDirection: "column",
        }}
      >
        <View style={{
          flex: 1,
          paddingHorizontal: 30,
          paddingTop: 20,
        }}>
          <Text style={{ fontWeight: '500', fontSize: 18 }}>{resource_detail_empty_heading}</Text>
          <Text style={{ fontWeight: '200', fontSize: 18, paddingTop: 10, }}>{resource_detail_empty_hint}</Text>
        </View>
        {shouldShowButtons ?
          <View style={{
            flex: 90,
            alignItems: 'flex-end',
            flexDirection: 'column-reverse',
          }}>
            <View style={{
              flexDirection: 'row-reverse',
              justifyContent: 'space-around',
              marginLeft: 25,
              width: SCREEN_WIDTH - 50
            }}>
              {/* Arrow icons pointing to menu buttons */}
              <DownArrow />
              <DownArrow />
              <View style={{ 
                flex: 1,
              }}/>
            </View>
          </View>
        : null }
      </View>
    );
  }

  getResourcesSection() {
    const { translation: { templates: { favourite_resource_heading, recent_resource_heading}}} = this.props;

    return (
      <View 
        style={{
          flex: 1,
        }}
      >
        <Text style={{
          marginLeft: 13,
        }}>
          {favourite_resource_heading}:
        </Text>
        {this.getFavouritesSection()}
        <Text style={{
          marginLeft: 13,
        }}>
          {recent_resource_heading}:
        </Text >
        {this.getRecentsSection()}
      </View>
    );
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
      <View 
        style={{
          backgroundColor: bgLightHighlight,
          flex: 1,
          paddingTop: 5,
        }}>
        {favouriteResources.length + recentResources.length === 0 ? this.getStartedSection() : this.getResourcesSection()}
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