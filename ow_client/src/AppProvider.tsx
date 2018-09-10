import * as React from 'react';
import { Component } from 'react';
import { SyncStatus } from './typings/enums';
import BaseApi from './api/BaseApi';
import { ConfigFactory } from './config/ConfigFactory';
import NetworkApi from './api/NetworkApi';
// import { AsyncStorage } from 'react-native';
//@ts-ignore
import * as AsyncStorage from 'rn-async-storage'
import { Resource } from './typings/models/OurWater';
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

export type AsyncMeta = {
  loading: boolean,
}

export interface GlobalState {
  syncStatus: SyncStatus,         //the status of any syncs that OW needs to make
  isConnected: boolean,           //are we connected to the internets? 
  userId: string,                 //the userId

  config: ConfigFactory | null,
  appApi: BaseApi | null,         //TODO: make non null
  networkApi: NetworkApi | null,

  //Functions - passed through via state to Consumers
  syncStatusChanged?: any,
  connectionStatusChanged?: any,
  userIdChanged?: any,

  favouriteResources: Resource[],
  favouriteResourcesMeta: AsyncMeta,


  //TODO: 
  //pendingReadings
  //isConnectedExternally
  //language and region
}

const defaultState: GlobalState = {
  syncStatus: SyncStatus.none,
  config: null,
  userId: 'unknown',
  isConnected: true,
  appApi: null,
  networkApi: null,
  favouriteResources: [],
  favouriteResourcesMeta: {loading: false},
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

  userChanged(sn: Snapshot) {
    console.log("got a user changed callback!", sn);
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

  /*
    addFavourite
    removeFavourite
    addRecentSearch
    addRecentResource
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