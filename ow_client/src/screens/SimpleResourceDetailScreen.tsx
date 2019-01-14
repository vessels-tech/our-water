/**
 * SimpleResourceScreen
 * 
 * Displays a list of the recent and favourite resources for the user's selected
 * resource type. If there are no recent or favourites, presents some text with an explanation
 * of how to find resources using the search or QR Code (and maybe map?)
 */

import * as React from 'react';
import { Component } from 'react';
import { Text, Button } from 'react-native-elements';
import { ConfigFactory } from '../config/ConfigFactory';
import BaseApi from '../api/BaseApi';
import { View } from 'react-native';
import {navigateTo, unwrapUserId, renderLog, showModal } from '../utils';
import { AppState } from '../reducers';
import { connect } from 'react-redux'
import ResourceDetailSection from '../components/ResourceDetailSection';
import { TranslationFile } from 'ow_translations';
import Loading from '../components/common/Loading';
import { SomeResult } from '../typings/AppProviderTypes';
import * as appActions from '../actions/index';
import { ActionMeta } from '../typings/Reducer';
import { AnyResource } from '../typings/models/Resource';
import { diff } from "deep-object-diff";
import { ResourceType } from '../enums';
import { isNullOrUndefined } from 'util';
import { secondary, primary, secondaryText } from '../utils/NewColors';


export interface OwnProps {
  navigator: any;
  config: ConfigFactory,
  resourceId: string,
  isPending: boolean,
}

export interface StateProps {
  translation: TranslationFile,
  // resource: AnyResource | null,
  resourceType: ResourceType,
  meta: ActionMeta,
  userId: string,
}

export interface ActionProps {
  getResource: (api: BaseApi, resourceId: string, userId: string) => Promise<SomeResult<AnyResource>>
}

export interface State {

}

class SimpleResourceDetailScreen extends React.PureComponent<OwnProps & StateProps & ActionProps> {
  appApi: BaseApi;

  constructor(props: OwnProps & StateProps & ActionProps) {
    super(props);
    this.appApi = props.config.getAppApi();

    // this.props.getResource(this.appApi, this.props.resourceId, this.props.userId);

    //Binds
    this.onAddReadingPressed = this.onAddReadingPressed.bind(this);
    this.onSyncButtonPressed = this.onSyncButtonPressed.bind(this);
  }

  componentWillUpdate(nextProps: OwnProps & StateProps & ActionProps, nextState: State, nextContext: any) {
    renderLog(`SimpleResourceDetailScreen componentDidUpdate, ${this.props.resourceId}, ${nextProps.resourceId}`);
    renderLog("     - ", diff(this.props, nextProps));
    renderLog("     - ", diff(this.state, nextState));

    if (this.props.resourceId !== nextProps.resourceId) {
      this.props.getResource(this.appApi, this.props.resourceId, this.props.userId);
    }
  }

  onAddReadingPressed(resourceId: string) { 
    const { resource_detail_new } = this.props.translation.templates;

    navigateTo(this.props, 'screen.NewReadingScreen', resource_detail_new, {
      resourceId,
      resourceType: this.props.resourceType,
      config: this.props.config,
      userId: this.props.userId
    });
  }

  onSyncButtonPressed() {
    const { settings_pending_heading } = this.props.translation.templates;

    showModal(
      this.props,
      'screen.PendingScreen',
      settings_pending_heading,
      {
        config: this.props.config,
      }
    );
  }

  getResourceDetailSection() {
    const { isPending } = this.props;
    const { 
      settings_pending_heading,
      resource_detail_sync_required,
    } = this.props.translation.templates;

    if (isPending) {
      return (
        <View
          style={{
            flex: 1,
            alignSelf: 'center',
            justifyContent: 'center',
            paddingVertical: 100,
          }}
        >
          <Text
            style={{
              flex: 1,
              paddingHorizontal: 30,
            }}
          >
            {resource_detail_sync_required}
          </Text>
          <Button
            color={secondaryText.high}
            buttonStyle={{
              backgroundColor: secondary,
              borderRadius: 5,
              // height: '100%',
            }}
            containerViewStyle={{
              flex: 1,
              alignSelf: 'center',
              justifyContent: 'center',
            }}
            title={settings_pending_heading}
            onPress={this.onSyncButtonPressed}
          />
        </View>
      );
    }

    return (
      <ResourceDetailSection
        config={this.props.config}
        hideTopBar={true}
        isPending={isPending}
        onAddReadingPressed={this.onAddReadingPressed}
        resourceId={this.props.resourceId}
        temporaryGroundwaterStationId={null}
      />
    );
  }

  render() {
    renderLog("SimpleResourceDetailScreen, render()");
    return (
      <View style={{
        width: '100%',
        height: '100%',
        alignContent: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        flex: 1,
      }}>
        {this.getResourceDetailSection()}
      </View>
    )
  }

}

const mapStateToProps = (state: AppState, ownProps: OwnProps): StateProps => {
  //Grab the resource from the list of resources
  let resource: AnyResource | null = null;
  let meta = state.resourceMeta[ownProps.resourceId];
  if (!meta) {
    meta = { loading: false, error: true, errorMessage: 'Something went wrong.' };
  }
  
  //TD Hacky way to get the resource
  state.resources.forEach(r => {
    if (r.id === ownProps.resourceId) {
      resource = r;
    }
  });
  if (!resource) {
    state.recentResources.forEach(r => {
      if (r.id === ownProps.resourceId) {
        resource = r;
      }
    })
  }
  if (!resource) {
    state.favouriteResources.forEach(r => {
      if (r.id === ownProps.resourceId) {
        resource = r;
      }
    })
  }
  
  let resourceType: ResourceType = ResourceType.well;
  if (!isNullOrUndefined(resource) && resource.resourceType) {
    resourceType = resource.resourceType;
  }

  return {
    translation: state.translation,
    resourceType,
    meta,
    userId: unwrapUserId(state.user),
  };
}

const mapDispatchToProps = (dispatch: any): ActionProps => {
  return {
    getResource: (api: BaseApi, resourceId: string, userId: string) => {
      return dispatch(appActions.getResource(api, resourceId, userId));
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(SimpleResourceDetailScreen);
