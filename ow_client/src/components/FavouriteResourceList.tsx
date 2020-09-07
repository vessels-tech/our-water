import * as React from 'react'; import { Component } from 'react';
import {
  Text,
  View,
  Dimensions,
  ScrollView,
} from 'react-native';
import {  Button } from 'react-native-elements'
import Icon from 'react-native-vector-icons/FontAwesome';

import { randomPrettyColorForId, getShortId, maybeLog, renderLog } from '../utils';
import FirebaseApi from '../api/DeprecatedFirebaseApi';

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
import { Stats } from 'fs';
import { PendingResource } from '../typings/models/PendingResource';

const SCREEN_WIDTH = Dimensions.get('window').width;


export interface OwnProps {
  userId: string,
  config: ConfigFactory,
  onResourceCellPressed: any,
  //If this exists, will filter the displayed resources to be only the given resource type
  filterResourceType?: ResourceType;


}

export interface StateProps {
  pendingResources: PendingResource[],
  favouriteResourcesMeta: SyncMeta,
  favouriteResources: AnyResource[],
  recentResourcesMeta: SyncMeta,
  recentResources: AnyResource[],
  translation: TranslationFile,
  renderCounter?: number,
}

export interface ActionProps {
}



export interface State {
  recents: any[],
}

/**
 * FavouriteResourceList displays a list of the recent or favourite
 * resources.
 * 
 */
class FavouriteResourceList extends React.PureComponent<OwnProps & StateProps & ActionProps> {
  unsubscribe: any;
  state: State;

  constructor(props: OwnProps & StateProps & ActionProps) {
    super(props);

    this.state = {
      // favourites: {},
      recents: []
    }

    /* binds */
    // this.props.onResourceCellPressed = this.props.onResourceCellPressed.bind(this)
  }


  getPendingSection() {
    if (!this.props.config.getFavouriteResourcesShouldShowPending()) {
      return null;
    }

    const { pending_resource_heading } = this.props.translation.templates;
    const { pendingResources } = this.props;

    if (pendingResources.length === 0) {
      return null;
    }

    return (
      <View>
        <Text style={{marginLeft: 13}}>{pending_resource_heading}:</Text>
        <View style={{
          flexWrap: 'wrap',
          flexDirection: 'row',
        }}
        >
          {pendingResources.map((r) => (
            <ResourceCell
              style={{ marginBottom: 15 }}
              key={r.id}
              config={this.props.config}
              resource={r}
              onResourceCellPressed={this.props.onResourceCellPressed}
            />
          ))
          }
        </View>
      </View>
    );
  }

  getFavouritesSection() {
    const { favourite_resource_hint_1, favourite_resource_hint_2 } = this.props.translation.templates;
    const { favouriteResourcesMeta, favouriteResources } = this.props;

    if (favouriteResourcesMeta.loading) {
      return <Loading/>
    }

    if (favouriteResources.length === 0) {
      const icon = (
        //@ts-ignore
        <Icon
          style={{
            flex: 1,
          }}
          raised={true}
          size={12}
          name='star'
          color='yellow'
        />);
    
      return (
        <Text style={{textAlign: 'center', paddingVertical: 50}}>
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
    const { recent_resource_none } = this.props.translation.templates;
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
              {/* TODO: Add QR/Map buttons here. */}
            </View>
          </View>
        : null }
      </View>
    );
  }

  getResourcesSection() {
    const { favourite_resource_heading, recent_resource_heading } = this.props.translation.templates;

    return (
      <View 
        style={{
          flex: 1,
        }}
      >
        {this.getPendingSection()}
        <Text style={{
          marginLeft: 13,
        }}>
          {favourite_resource_heading}:
        </Text>
        {this.getFavouritesSection()}
        <Text style={{
          // marginTop: 100,
          marginLeft: 13,
        }}>
          {recent_resource_heading}:
        </Text >
        {this.getRecentsSection()}
      </View>
    );
  }

  render() {
    const { pendingResources, recentResources, favouriteResources } = this.props;

    renderLog(`FavouriteResourceList render(). Count: ${this.props.renderCounter}`);

    return (
      <View 
        style={{
          backgroundColor: bgLightHighlight,
          flex: 1,
          paddingTop: 5,
        }}>
        {pendingResources.length + favouriteResources.length + recentResources.length === 0 ? 
          this.getStartedSection() : 
          this.getResourcesSection()
        }
      </View>
    );
  }
}

const mapStateToProps = (state: AppState, ownProps: OwnProps): StateProps => {
  let pendingResources = state.pendingSavedResources;
  let favouriteResources = state.favouriteResources;
  let recentResources = state.recentResources;

  if (ownProps.filterResourceType) {
    pendingResources = pendingResources.filter(r => r.resourceType === ownProps.filterResourceType);
    
    //A little clunky as resourceType doesn't exist on GGMNResource.
    favouriteResources = favouriteResources.filter(r => r.type === OrgType.GGMN || r.resourceType === ownProps.filterResourceType);
    recentResources = recentResources.filter(r => r.type === OrgType.GGMN || r.resourceType === ownProps.filterResourceType);
  }

  return {
    pendingResources,
    favouriteResourcesMeta: state.favouriteResourcesMeta,
    favouriteResources,
    recentResourcesMeta: state.recentResourcesMeta,
    recentResources,
    translation: state.translation,
  }
}

const mapDispatchToProps = (dispatch: any): ActionProps => {
  return {
   
  }
}

export default connect(mapStateToProps, mapDispatchToProps, null, { renderCountProp: 'renderCounter' })(FavouriteResourceList);