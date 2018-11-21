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
import { TranslationFile } from 'ow_translations';



export interface OwnProps {
  userId: string,
  navigator: any;
  config: ConfigFactory,
  appApi: BaseApi,
  resource: Resource,
}

export interface StateProps {
  translation: TranslationFile,
}

export interface ActionProps {

}



class SimpleResourceDetailScreen extends Component<OwnProps & StateProps & ActionProps> {


  getResourceDetailSection() {
    const { userId, resource, translation: { templates: { resource_detail_new } } } = this.props;

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
  return {
    translation: state.translation,
  };
}

const mapDispatchToProps = (dispatch: any): ActionProps => {
  return {
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(SimpleResourceDetailScreen);
