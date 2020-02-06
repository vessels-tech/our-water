/**
 * Main OurWater App
 * 
 */
import * as React from 'react'; 
import { Component } from 'react';
//Disable the annoying yellow box in prod.
console.ignoredYellowBox = ['Remote debugger'];
import {
  HomeScreenType,
} from './enums';
import BaseApi from './api/BaseApi';
import { ConfigFactory } from './config/ConfigFactory';
import { connect } from 'react-redux'
import { AppState } from './reducers';
import * as appActions from './actions/index';
import { MaybeExternalServiceApi } from './api/ExternalServiceApi';
import { TranslationFile } from 'ow_translations';
import HomeMapScreen from './screens/HomeMapScreen';
import HomeSimpleScreen from './screens/HomeSimpleScreen';

//Logging and crash helpers
import './utils/Crashlytics';
import { ScreenVisibilityListener } from './utils/ScreenVisibilityListener';

export interface OwnProps {
  config: ConfigFactory,
  appApi: BaseApi, 
}

export interface StateProps {  
  translation: TranslationFile,
}

export interface ActionProps {
  getGeoLocation(): () => any,
}

export interface State {
}

class App extends Component<OwnProps & StateProps & ActionProps> {
  state: State = {};
  appApi: BaseApi;
  externalApi: MaybeExternalServiceApi;
  screenListener: ScreenVisibilityListener;

  constructor(props: OwnProps & StateProps & ActionProps) {
    super(props);


    //Hide the react-native-splashscreen
    //ref: https://medium.com/handlebar-labs/how-to-add-a-splash-screen-to-a-react-native-app-ios-and-android-30a3cec835ae
    // SplashScreen.hide()
  

    //@ts-ignore
    this.appApi = props.config.getAppApi();
    this.externalApi = props.config.getExternalServiceApi();

    //Set up screen visibility listener:
    this.screenListener = new ScreenVisibilityListener();
  }

  componentDidMount() {
    this.props.getGeoLocation();
    this.screenListener.register();
  }

  componentWillUnmount() {
    this.screenListener.unregister();
  }
  
  render() {
    //TODO: check the settings

    switch(this.props.config.getHomeScreenType()) {
      case (HomeScreenType.Map): {
        return (
          <HomeMapScreen
            config={this.props.config}
            appApi={this.props.appApi}
          />
        )
      }
      case (HomeScreenType.Simple): {
        return (
          <HomeSimpleScreen
            config={this.props.config}
            appApi={this.props.appApi}
          />
        );
      }
    }
  }
}

//If we don't have a user id, we should load a different app I think.
const mapStateToProps = (state: AppState, ownProps: OwnProps): StateProps => {
  return {
    translation: state.translation,
  }
}

const mapDispatchToProps = (dispatch: any): ActionProps => {
  return {
    getGeoLocation: () => dispatch(appActions.getGeolocation()),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(App);