import * as React from 'react';
import { Component } from 'react';
import { SyncStatus } from './typings/enums';
import BaseApi from './api/BaseApi';
import { ConfigFactory } from './config/ConfigFactory';
import NetworkApi from './api/NetworkApi';
// import { AsyncStorage } from 'react-native';
//@ts-ignore
import * as AsyncStorage from 'rn-async-storage'
import { Resource, Reading } from './typings/models/OurWater';
import { RNFirebase } from "react-native-firebase";
type Snapshot = RNFirebase.firestore.QuerySnapshot;


/**
 * App provider uses the React Context api to manage any global state.
 */

/*
  TODO: this is less than ideal, as it means we need to rely
  on config being passed through everywhere still.

  A better situation would be to use the shared state to set up the config for us, 
  and init the app api from the constructor here.

  Or better yet, abstract away the app api as a series of Actions - more like redux
  we can leave it for now, as it's no major issue, but this would be a better architecture
  in the end.
*/
export interface Props {
  config: ConfigFactory,
};

export type ActionMeta = {
  loading: boolean,
}

export type SyncMeta = {
  loading: boolean,
  //TODO: Add sync states
}

export interface GlobalState {
  syncStatus: SyncStatus,         //the status of any syncs that OW needs to make
  isConnected: boolean,           //are we connected to the internets? 
  userId: string,                 //the userId

  config: ConfigFactory | null,
  appApi: BaseApi | null,         //TODO: make non null
  networkApi: NetworkApi | null,

  //Adding other user-based models
  favouriteResources: Resource[],
  favouriteResourcesMeta: ActionMeta,
  recentResources: Resource[],
  recentResourcesMeta: ActionMeta,
  pendingSavedReadings: Reading[], //TODO: figure out how to load from collections
  pendingSavedReadingsMeta: SyncMeta,
  pendingSavedResources: Reading[],
  pendingSavedResourcesMeta: SyncMeta,

  //Functions - passed through via state to Consumers
  syncStatusChanged?: any,
  connectionStatusChanged?: any,
  userIdChanged?: any,
  action_addFavourite?: any,
  action_removeFavourite?: any,
  action_addRecent?: any,

  action_saveReading?: any,
  action_saveResource?: any



  //TODO: 
  //pendingReadings
  //isConnectedExternally
  //language and region
}

const defaultState: GlobalState = {
  syncStatus: SyncStatus.none,
  config: null,
  userId: 'unknown',
  isConnected: false,
  appApi: null,
  networkApi: null,
  favouriteResources: [],
  favouriteResourcesMeta: {loading: false},
  recentResources: [],
  recentResourcesMeta: {loading: false},
  pendingSavedReadings: [],
  pendingSavedReadingsMeta: { loading: false },
  pendingSavedResources: [], 
  pendingSavedResourcesMeta: { loading: false },
}

export const AppContext = React.createContext(defaultState);

const storageKey = "AppProviderState";

export default class AppProvider extends Component<Props> {
  state: GlobalState = defaultState;
  connectionChangeCallbackId: string;
  networkApi: NetworkApi;
  appApi: BaseApi;

  unsubscribeFromUser: any;

  constructor(props: Props) {
    super(props);

    this.appApi = props.config.getAppApi();
    this.networkApi = props.config.networkApi;

    //TODO: ask api to trigger first status update now

    //TODO: fix needing userId here...
    // appApi.subscribeToPendingReadings('12345', this.syncStatusChanged.bind(this));
    this.connectionChangeCallbackId = this.networkApi.addConnectionChangeCallback(this.connectionStatusChanged.bind(this));

    this.state = {
      ...defaultState,
      appApi: this.appApi,
      networkApi: this.networkApi,
      config: this.props.config,

      //Callbacks must be registered here in order to get called properly
      connectionStatusChanged: this.connectionStatusChanged.bind(this),
      userIdChanged: this.userIdChanged.bind(this),
      
      //TODO: Move elsewhere?
      action_addFavourite: this.action_addFavourite.bind(this),
      action_removeFavourite: this.action_removeFavourite.bind(this),
      action_addRecent: this.action_addRecent.bind(this),
      action_saveReading: this.action_saveReading.bind(this),
      action_saveResource: this.action_saveResource.bind(this),
    }

    AsyncStorage.getItem(storageKey)
    .then((lastStateStr: string) => {
      let lastState = {};
      if (lastStateStr) {
        lastState = JSON.parse(lastStateStr);
      }
      console.log("lastState", lastState);

      this.state = {
        ...lastState,
        ...this.state,
      };

      //@ts-ignore
      if (lastState.userId) {
        //@ts-ignore
        this.subscribeToUserUpdates(lastState.userId);
      }
    })
    .catch((err: Error) => {
      console.log("err", err);
    })
  }

  private subscribeToUserUpdates(userId: string) {
    if (this.unsubscribeFromUser) {
      this.unsubscribeFromUser();
    }

    this.unsubscribeFromUser = this.appApi.subscribeToUser(
      userId, (sn: Snapshot) => this.userChanged(sn));
  }

  async componentDidMount()  {
    if (this.state.networkApi) {
      await this.state.networkApi.updateConnectionStatus();
    }
  }

  componentWillUnmount() {
    //Make sure to remove all subscriptions here.
    this.networkApi.removeConnectionChangeCallback(this.connectionChangeCallbackId);
    this.unsubscribeFromUser();
  }

  async persistState() {
    const toSave = {
      //TODO: strip out anything that we don't want to save
      isConnected: this.state.isConnected,
      userId: this.state.userId,
    };
    await AsyncStorage.setItem(storageKey, JSON.stringify(toSave));
    console.log("finished persisting state", toSave);
  }

  //
  // Global State-modifying callbacks
  //------------------------------------------------------------------------------

  syncStatusChanged(syncStatus: SyncStatus) {
    console.log('syncStatusChanged');
    this.setState({syncStatus}, async () => await this.persistState());
  }

  connectionStatusChanged(isConnected: boolean) {
    if (this.state.isConnected === isConnected) {
      return;
    }

    console.log('connectionStatusChanged', isConnected);
    this.setState({isConnected}, async () => await this.persistState());
  }

  userIdChanged(userId: string) {
    this.subscribeToUserUpdates(userId);
    this.setState({userId}, async () => await this.persistState())
  }

  userChanged(sn: any) {
    console.log("got a user changed callback!", sn.data());
    const userData = sn.data();

    if (!userData) {
      console.log("ERROR: onUserChanged -> userData is undefined.");
      return;
    }


    /* Map from Firebase Domain to our Domain*/
    const favouriteResourcesDict = userData.favouriteResources;
    const favouriteResources = Object.keys(favouriteResourcesDict)
      .map(key => favouriteResourcesDict[key])
      .filter(r => r !== null);  //Null resources are ones that were added but have been removed
    this.setState({
      favouriteResources,
      recentResources: userData.recentResources,
    });
  }


  //
  // Async Actions
  //------------------------------------------------------------------------------

  //TODO: abstract away to another file somewhere

  /**
   * Add a resourceId to the user's favourites
   */
  async action_addFavourite(resource: Resource): Promise<any> {
    const { userId } = this.state;
    //TODO: should this return straight away? 
    //Or only after the user's object has been updated?

    //TODO: tidy this up later on
    this.setState({favouriteResourcesMeta: {loading: true}});
    await this.appApi.addFavouriteResource(resource, userId);
    this.setState({favouriteResourcesMeta: { loading: false }});
  }

  async action_removeFavourite(resourceId: string): Promise<any> {
    const { userId } = this.state;

    this.setState({favouriteResourcesMeta: {loading: true}});
    await this.appApi.removeFavouriteResource(resourceId, userId);
    this.setState({favouriteResourcesMeta: { loading: false }});
  }

  async action_addRecent(resource: Resource): Promise<any> {
    const { userId } = this.state;

    this.setState({ recentResourcesMeta: { loading: true } });
    await this.appApi.addRecentResource(resource, userId);
    this.setState({ recentResourcesMeta: { loading: false } });
  }

  async action_saveReading(resourceId: string, reading: Reading): Promise<any> {
    const { userId } = this.state;

    this.setState({ pendingSavedReadingsMeta: { loading: true } });
    return this.appApi.saveReading(resourceId, userId, reading)
    .then(result => {
      if (result.requiresLogin) {
        //TODO: finish this off later - too tired now :(
      }
    })


  }

  async action_saveResource(resource: Resource): Promise<any> {
    //TODO: implement
  }

  /*
    addRecentSearch
    saveReading
    saveResource

    connectToExternalService
    disconnectFromExternalService
  */


  render() {
    return (
      <AppContext.Provider
        value={{
          ...this.state,
        }}>
        {this.props.children}
      </AppContext.Provider>
    );
  }
}