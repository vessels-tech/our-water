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
import {navigateTo, unwrapUserId, renderLog, showModal, maybeLog, formatShortId } from '../utils';
import { AppState } from '../reducers';
import { connect } from 'react-redux'
import ResourceDetailSection from '../components/ResourceDetailSection';
import { TranslationFile } from 'ow_translations';
import Loading from '../components/common/Loading';
import { SomeResult, ResultType } from '../typings/AppProviderTypes';
import * as appActions from '../actions/index';
import { ActionMeta } from '../typings/Reducer';
import { AnyResource } from '../typings/models/Resource';
import { diff } from "deep-object-diff";
import { ResourceType } from '../enums';
import { isNullOrUndefined } from 'util';
import { secondary, primary, secondaryText } from '../utils/NewColors';
import { navigateToNewReadingScreen } from '../utils/NavigationHelper';
import { PendingResource } from '../typings/models/PendingResource';
import { OrgType } from '../typings/models/OrgType';


export interface OwnProps {
  navigator: any;
  config: ConfigFactory,
  resourceId: string,
  isPending: boolean,
}

export interface StateProps {
  translation: TranslationFile,
  resourceType: ResourceType,
  meta: ActionMeta,
  userId: string,
  shortId?: string,
  shortIdMeta: ActionMeta
}

export interface ActionProps {
  getResource: (api: BaseApi, resourceId: string, userId: string) => Promise<SomeResult<AnyResource>>,
  getShortId: (api: BaseApi, resourceId: string) => any,

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
    this.onEditReadingsPressed = this.onEditReadingsPressed.bind(this);
    this.onSyncButtonPressed = this.onSyncButtonPressed.bind(this);
  }

  componentDidMount() {
    
    if (this.props.shortId) {
      this.props.navigator.setTitle({ title: this.props.shortId});
    } else {
      this.props.navigator.setTitle({title: "Loading..."});
      this.props.getShortId(this.appApi, this.props.resourceId);
    }
  }

  componentWillUpdate(nextProps: OwnProps & StateProps & ActionProps, nextState: State, nextContext: any) {
    renderLog(`SimpleResourceDetailScreen componentDidUpdate, ${this.props.resourceId}, ${nextProps.resourceId}`);
    renderLog("     - ", diff(this.props, nextProps));
    renderLog("     - ", diff(this.state, nextState));

    if (this.props.resourceId !== nextProps.resourceId) {
      this.props.getResource(this.appApi, this.props.resourceId, this.props.userId);
    }

    if (!this.props.shortId && nextProps.shortId) {
        this.props.navigator.setTitle({ title: nextProps.shortId });
    }
  }

  onEditReadingsPressed(resourceId: string) {
    const {
      resource_detail_edit_readings,
    } = this.props.translation.templates;

    showModal(this.props, 'screen.EditReadingsScreen', resource_detail_edit_readings, {
      resourceId,
      config: this.props.config,
      resourceType: this.props.resourceType
    })
  }

  onAddReadingPressed(resourceId: string) { 
    const { resource_detail_new } = this.props.translation.templates;

    // navigateTo(this.props, 'screen.NewReadingScreen', resource_detail_new, {
    //   resourceId,
    //   resourceType: this.props.resourceType,
    //   config: this.props.config,
    //   userId: this.props.userId
    // });
    navigateToNewReadingScreen(this.props, resource_detail_new, {
      navigator: this.props.navigator,
      groundwaterStationId: null, //TD for ggmn only
      resourceId,
      resourceType: this.props.resourceType,
      config: this.props.config,
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
      // resource_detail_sync_required,
    } = this.props.translation.templates;

    //TODO: Translate
    const resource_detail_sync_required = "Location needs to be synced before you can save any readings."; 

    return (
      <ResourceDetailSection
        config={this.props.config}
        hideTopBar={true}
        isPending={isPending}
        onAddReadingPressed={this.onAddReadingPressed}
        onEditReadingsPressed={this.onEditReadingsPressed}
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
    );
  }

}

const mapStateToProps = (state: AppState, ownProps: OwnProps): StateProps => {
  //Grab the resource from the list of resources
  let maybeResource: PendingResource | AnyResource | undefined;
  let meta = state.resourceMeta[ownProps.resourceId];
  if (!meta) {
    meta = { loading: false, error: true, errorMessage: 'Something went wrong.' };
  }
  

  maybeResource = state.resources.find((r) => r.id === ownProps.resourceId);
  if (!maybeResource) {maybeResource = state.pendingSavedResources.find((r) => r.id === ownProps.resourceId);}
  if (!maybeResource) {maybeResource = state.recentResources.find((r) => r.id === ownProps.resourceId);}
  if (!maybeResource) {maybeResource = state.favouriteResources.find((r) => r.id === ownProps.resourceId);}

  let resourceType: ResourceType = ResourceType.well;
  if (isNullOrUndefined(maybeResource)) {
    maybeLog(`Resource of id: ${ownProps.resourceId} couldn't be found. Defaulting resourceType to well`);
  } else {
    if (maybeResource.pending || maybeResource.type === OrgType.MYWELL) {
      resourceType = maybeResource.resourceType;
    }
  }

  let shortId;
  const shortIdRaw = state.shortIdCache[ownProps.resourceId];
  const shortIdResult = formatShortId(shortIdRaw);
  if (shortIdResult.type === ResultType.SUCCESS) {
    shortId = shortIdResult.result;
  }
  let shortIdMeta = state.shortIdMeta[ownProps.resourceId];
  if (!shortId || !shortIdMeta) {
    shortIdMeta = { loading: false, error: false, errorMessage: '' };
  }

  return {
    translation: state.translation,
    resourceType,
    meta,
    userId: unwrapUserId(state.user),
    shortId,
    shortIdMeta,
  };
}

const mapDispatchToProps = (dispatch: any): ActionProps => {
  return {
    getResource: (api: BaseApi, resourceId: string, userId: string) => {
      return dispatch(appActions.getResource(api, resourceId, userId));
    },
    getShortId: (api: BaseApi, resourceId: string) => dispatch(appActions.getShortId(api, resourceId))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(SimpleResourceDetailScreen);
