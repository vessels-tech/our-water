import * as React from 'react';
import { Component } from 'react';
import { SyncStatus } from './typings/enums';
import BaseApi from './api/BaseApi';
import { ConfigFactory } from './config/ConfigFactory';
import NetworkApi from './api/NetworkApi';
// import { AsyncStorage } from 'react-native';
//@ts-ignore
import * as AsyncStorage from 'rn-async-storage'

/**
 * App provider uses the React Context api to manage any global state.
 */

export interface Props {
  config: ConfigFactory,
};

export interface GlobalState {
  syncStatus: SyncStatus,         //the status of any syncs that OW needs to make
  isConnected: boolean,           //are we connected to the internets? 
  userId: string | null,                 //the userId

  config: ConfigFactory | null,
  appApi: BaseApi | null,         //TODO: make non null
  networkApi: NetworkApi | null,

  //Functions - passed through via state to Consumers
  syncStatusChanged?: any,
  connectionStatusChanged?: any,
  userIdChanged?: any,


  //TODO: 
  //pendingReadings
  //isConnectedExternally
  //language and region
}

const defaultState: GlobalState = {
  syncStatus: SyncStatus.none,
  config: null,
  userId: null,
  isConnected: true,
  appApi: null,
  networkApi: null,
}

export const AppContext = React.createContext(defaultState);

const storageKey = "AppProviderState";

export default class AppProvider extends Component<Props> {
  state: GlobalState = defaultState;
  connectionChangeCallbackId: string;
  networkApi: NetworkApi;

  constructor(props: Props) {
    super(props);

    const appApi = props.config.getAppApi();
    this.networkApi = props.config.networkApi;

    //TODO: ask api to trigger first status update now

    //TODO: fix needing userId here...
    // appApi.subscribeToPendingReadings('12345', this.syncStatusChanged.bind(this));
    this.connectionChangeCallbackId = this.networkApi.addConnectionChangeCallback(this.connectionStatusChanged.bind(this));

    this.state = {
      ...defaultState,
      appApi,
      networkApi: this.networkApi,
      config: this.props.config,

      //Callbacks must be registered here in order to get called properly
      connectionStatusChanged: this.connectionStatusChanged.bind(this),
      userIdChanged: this.userIdChanged.bind(this),
    }

    // AsyncStorage.getItem(storageKey)
    // .then((lastStateStr: string) => {
    //   let lastState = {};
    //   if (lastStateStr) {
    //     lastState = JSON.parse(lastStateStr);
    //   }
    //   console.log("lastState", lastState);

    //   this.state = {
    //     ...lastState,
    //     ...this.state,
    //   };

    //   //TODO: set up user-based subscriptions if we have a userId?
    // })
    // .catch((err: Error) => {
    //   console.log("err", err);
    // })
  }

  async componentDidMount()  {
    if (this.state.networkApi) {
      await this.state.networkApi.updateConnectionStatus();
    }

    await AsyncStorage.getItem(storageKey)
    .then((lastStateStr: string) => {
      let lastState = {};
      if (lastStateStr) {
        lastState = JSON.parse(lastStateStr);
      }
      console.log("lastState", lastState);

      this.setState({
        ...lastState,
      });

      //TODO: set up user-based subscriptions if we have a userId?
    })
    .catch((err: Error) => {
      console.log("err", err);
    })
  }

  componentWillUnmount() {
    //Make sure to remove all subscriptions here.
    this.networkApi.removeConnectionChangeCallback(this.connectionChangeCallbackId);
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
    console.log("userIdChanged", userId);
    //TODO: modify user based subscriptions?
    console.log("TODO: modify user based subscriptions for userId");

    this.setState({userId}, async () => await this.persistState())
  }

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