/**
 * SimpleResourceScreen
 * 
 * Displays a list of the recent and favourite resources for the user's selected
 * resource type. If there are no recent or favourites, presents some text with an explanation
 * of how to find resources using the search or QR Code (and maybe map?)
 */

import * as React from 'react';
import { Component } from 'react';
import { Text } from 'react-native-elements';
import { ConfigFactory } from '../config/ConfigFactory';
import BaseApi from '../api/BaseApi';
import { View } from 'react-native';
import { navigateTo, getShortIdOrFallback } from '../utils';
import { ResourceType } from '../enums';
import FavouriteResourceList from '../components/FavouriteResourceList';
import { AppState, CacheType } from '../reducers';
import { connect } from 'react-redux'
import { AnyResource } from '../typings/models/Resource';
import { PendingResource } from '../typings/models/PendingResource';
import * as appActions from '../actions/index';
import { UserType } from '../typings/UserTypes';


export interface OwnProps {
  navigator: any;
  config: ConfigFactory,
  appApi: BaseApi,
  resourceType: ResourceType
}

export interface StateProps {
  userId: string,
  shortIdCache: CacheType<string>, //resourceId => shortId
}

export interface ActionProps {
  addRecent: any,
}



class SimpleResourceScreen extends Component<OwnProps & StateProps & ActionProps> {
  appApi: BaseApi;

  constructor(props: OwnProps & StateProps & ActionProps) {
    super(props);

    this.appApi = props.config.getAppApi();


    /* binds */
    this.selectResource = this.selectResource.bind(this);
  }

  selectResource(resource: AnyResource | PendingResource) {
    const title = getShortIdOrFallback(resource.id, this.props.shortIdCache);
    //Navigate to a standalone resource view
    navigateTo(this.props, 'screen.SimpleResourceDetailScreen', title, {
      resourceId: resource.id,
      config: this.props.config,
      userId: this.props.userId,
      isPending: resource.pending,
    });

    if (resource.pending) {
      //Don't add to recents if it's pending.
      return;
    }

    this.props.addRecent(this.appApi, this.props.userId, resource);
  }

  render() {
    return (
      <View style={{
        width: '100%',
        height: '100%',
        alignContent: 'center',
        flexDirection: 'column',
        flex: 1,
      }}>

        {/* TODO: add filter */}
        <FavouriteResourceList
          config={this.props.config}
          userId={this.props.userId}
          filterResourceType={this.props.resourceType}
          onResourceCellPressed={this.selectResource}
        />
      </View>
    )
  }

}

//If we don't have a user id, we should load a different app I think.
const mapStateToProps = (state: AppState, ownProps: OwnProps): StateProps => {
  let userId = ''; //I don't know if this fixes the problem...
  if (state.user.type !== UserType.NO_USER) {
    userId = state.user.userId;
  }

  return {
    shortIdCache: state.shortIdCache,
    userId,
  };
}

const mapDispatchToProps = (dispatch: any): ActionProps => {
  return {
    addRecent: (api: BaseApi, userId: string, resource: AnyResource) => {
      dispatch(appActions.addRecent(api, userId, resource))
    },
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(SimpleResourceScreen);
