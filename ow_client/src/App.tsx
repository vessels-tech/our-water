/**
 * Main OurWater App
 *
 */
import * as React from 'react';
import { Component } from 'react';
//Disable the annoying yellow box in prod.
console.ignoredYellowBox = ['Remote debugger'];
import { Navigation } from 'react-native-navigation';
import {
  HomeScreenType, NavigationButtons
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
import { getOrElse } from 'ow_common/lib/utils';
import { PlaceResult, PartialResourceResult, SearchResultType } from 'ow_common/lib/api/SearchApi';

//Logging and crash helpers
import './utils/Crashlytics';
import { ScreenVisibilityListener } from './utils/ScreenVisibilityListener';
import { dismissModal, navigateTo, showModal } from './utils';

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
  private searchModalId?: string;

  constructor(props: OwnProps & StateProps & ActionProps) {
    super(props);


    this.onSearchResultPressed = this.onSearchResultPressed.bind(this);

    //Hide the react-native-splashscreen
    //ref: https://medium.com/handlebar-labs/how-to-add-a-splash-screen-to-a-react-native-app-ios-and-android-30a3cec835ae
    // SplashScreen.hide()

    Navigation.events().registerNavigationButtonPressedListener(async data => {
      switch (data.buttonId) {
        case NavigationButtons.ModalBack:
          Navigation.dismissModal(data.componentId)
          break;
        case NavigationButtons.SideMenu:
          Navigation.mergeOptions(data.componentId, {
            sideMenu: {
              left: {
                visible: true
              }
            }
          });
          break;
        case NavigationButtons.Search:
          this.searchModalId = await showModal(
            props,
            'screen.SearchScreen',
            'Search',
            { text: 'Search', onSearchResultPressed: this.onSearchResultPressed, config: props.config },
            'searchModal'
          )
          break;
        default:
          break;
      }
    });


    //@ts-ignore
    this.appApi = props.config.getAppApi();
    this.externalApi = props.config.getExternalServiceApi();

    //Set up screen visibility listener:
    this.screenListener = new ScreenVisibilityListener();
  }


  /**
   * Handle when a user clicks a result from the search screen.
   *
   */
  async onSearchResultPressed(r: PartialResourceResult | PlaceResult): Promise<void> {
    switch(r.type) {
      case SearchResultType.PartialResourceResult: {
        //TODO: load the resource type
        //TODO: translate loading
        navigateTo(this.props, 'screen.SimpleResourceDetailScreen', getOrElse(r.shortId, "Loading..."), {
          resourceId: r.id,
          config: this.props.config,
          userId: '' // todo: kevin
        });
        break;
      }
      case SearchResultType.PlaceResult: {
        //TODO: also drop a marker?
        //TODO: Translate
        const settings_map = "Browse on Map"

        navigateTo(
          this.props,
          'screen.SimpleMapScreen',
          settings_map,
          {
            config: this.props.config,
            initialRegion: {
              latitude: r.coords.latitude,
              longitude: r.coords.longitude,
              //TODO: improve this calculation to make more accurate to the
              // latitudeDelta: Math.abs(r.boundingBox[0] - r.boundingBox[2]) / 2,
              // longitudeDelta: Math.abs(r.boundingBox[1] - r.boundingBox[3]) / 2,
              latitudeDelta: 10,
              longitudeDelta: 10,
            }
          }
        )
        break;
      }
    }

    await dismissModal(this.searchModalId);
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
