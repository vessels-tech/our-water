/**
 * Main OurWater App
 * 
 */
import * as React from 'react'; import { Component } from 'react';
import {
  BackHandler,
  ScrollView,
  Text,
  View,
  ProgressBarAndroid,
  ToastAndroid,
} from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import Loading from './components/common/Loading';
import ResourceDetailSection from './components/ResourceDetailSection';
import { Location, LocationType } from './typings/Location';
import { 
  navigateTo,
  showModal,
  maybeLog,
} from './utils';
import {
  MapStateOption,
  MapHeightOption,
  HomeScreenType,
} from './enums';
import { bgLight, primaryDark, primary, primaryLight } from './utils/Colors';
import FavouriteResourceList from './components/FavouriteResourceList';
import BaseApi from './api/BaseApi';
import { ConfigFactory } from './config/ConfigFactory';
import { Resource, BasicCoords } from './typings/models/OurWater';
import { isNullOrUndefined } from 'util';
import MapSection, { MapRegion } from './components/MapSection';
import PendingChangesBanner from './components/PendingChangesBanner';
import { SyncStatus } from './typings/enums';

import { connect } from 'react-redux'
import NetworkStatusBanner from './components/NetworkStatusBanner';
import { AppState } from './reducers';
import * as appActions from './actions/index';
import { UserType } from './typings/UserTypes';
import { ActionMeta, SyncMeta } from './typings/Reducer';
import { ResultType, SomeResult } from './typings/AppProviderTypes';
import ExternalServiceApi, { MaybeExternalServiceApi } from './api/ExternalServiceApi';
import { GGMNSearchEntity } from './typings/models/GGMN';
import { TranslationFile } from 'ow_translations/Types';
import { SearchButtonPressedEvent } from './utils/Events';
//@ts-ignore
import EventEmitter from "react-native-eventemitter";
import HomeMapScreen from './screens/HomeMapScreen';
import HomeSimpleScreen from './screens/HomeSimpleScreen';


export interface OwnProps {
  navigator: any;
  config: ConfigFactory,
  appApi: BaseApi, 
}

export interface StateProps {  
}

export interface ActionProps {

}

export interface State {
}

class App extends Component<OwnProps & StateProps & ActionProps> {
  state: State = {};
  appApi: BaseApi;
  externalApi: MaybeExternalServiceApi;

  constructor(props: OwnProps & StateProps & ActionProps) {
    super(props);

    //@ts-ignore
    this.appApi = props.config.getAppApi();
    this.externalApi = props.config.getExternalServiceApi();
  }

  render() {
    //TODO: check the settings

    switch(this.props.config.getHomeScreenType()) {
      case (HomeScreenType.Map): {
        return (
          <HomeMapScreen
            navigator={this.props.navigator}
            config={this.props.config}
            appApi={this.props.appApi}
          />
        )
      }
      case (HomeScreenType.Simple): {
        <HomeSimpleScreen
          navigator={this.props.navigator}
          config={this.props.config}
          appApi={this.props.appApi}
        />
      }
    }
  }
}

export default App;