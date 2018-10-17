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
import { View, TouchableNativeFeedback } from 'react-native';
import { randomPrettyColorForId, navigateTo } from '../utils';
import { ResourceType } from '../enums';
import FavouriteResourceList from '../components/FavouriteResourceList';
import { AppState } from '../reducers';
import { UserType } from '../typings/UserTypes';
import { connect } from 'react-redux'
import { Resource } from '../typings/models/OurWater';
import ResourceDetailSection from '../components/ResourceDetailSection';
import { TranslationFile } from 'ow_translations/Types';
import Loading from '../components/common/Loading';
import { SomeResult } from '../typings/AppProviderTypes';
import * as appActions from '../actions/index';




export interface OwnProps {
  userId: string,
  navigator: any;
  config: ConfigFactory,
  resourceId: string,
}

export interface StateProps {
  translation: TranslationFile,
  resource: Resource | null,
}

export interface ActionProps {
  getResource: (api: BaseApi, resourceId: string, userId: string) => Promise<SomeResult<Resource>>
}



class SimpleResourceDetailScreen extends Component<OwnProps & StateProps & ActionProps> {
  appApi: BaseApi;

  constructor(props: OwnProps & StateProps & ActionProps) {
    super(props);

    this.appApi = props.config.getAppApi();
  }

  getResourceDetailSection() {
    const { userId, resource, translation: { templates: { resource_detail_new } } } = this.props;

    //TODO: we should try and use proper metadata instead
    if (!resource) {
      //This is dodgy - need to think of a better way
      this.props.getResource(this.appApi, this.props.resourceId, this.props.userId);
      return <Loading/>
    }

    return (
      <ResourceDetailSection
        hideTopBar={true}
        config={this.props.config}
        userId={userId}
        resource={resource}
        onAddReadingPressed={(resource: Resource) => {
          navigateTo(this.props, 'screen.NewReadingScreen', resource_detail_new, {
            resource,
            config: this.props.config,
            userId: this.props.userId
          });
        }}
      />
    );
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
        {this.getResourceDetailSection()}
      </View>
    )
  }

}

//If we don't have a user id, we should load a different app I think.
const mapStateToProps = (state: AppState, ownProps: OwnProps): StateProps => {
  //Grab the resource from the list of resources
  let resource = null;

  state.resources.forEach(r => {
    if (r.id === ownProps.resourceId) {
      resource = r;
    }
  });

  return {
    translation: state.translation,
    resource,
  };
}

const mapDispatchToProps = (dispatch: any): ActionProps => {
  return {
    getResource: (api: BaseApi, resourceId: string, userId: string) => {
      return dispatch(appActions.getResource(api, resourceId, userId));
    }

    // addRecent: (api: BaseApi, userId: string, resource: Resource) => {
    //   dispatch(appActions.addRecent(api, userId, resource))
    // },
    // loadResourcesForRegion: (api: BaseApi, userId: string, region: Region) =>
    //   dispatch(appActions.getResources(api, userId, region)),
    // startExternalSync: (api: MaybeExternalServiceApi, userId: string) =>
    //   dispatch(appActions.startExternalSync(api, userId)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(SimpleResourceDetailScreen);
