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
  syncStatus: SyncStatus, // the status of any syncs that OW needs to make
  isConnected: boolean, //are we connected to the internets? 

  appApi: BaseApi | null, //TODO: make non null
  networkApi: NetworkApi | null,

  //Functions - do we need to pass these through?
  syncStatusChanged?: any,
  connectionStatusChanged?: any,


  //TODO: 
  //pendingReadings
  //userId
  //isConnectedExternally
  //language and region
}

const defaultState: GlobalState = {
  syncStatus: SyncStatus.none,
  isConnected: false,
  appApi: null,
  networkApi: null,
}

export const AppContext = React.createContext(defaultState);
// export const AppContext = React.createContext({});

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
    appApi.subscribeToPendingReadings('12345', this.syncStatusChanged.bind(this));
    this.connectionChangeCallbackId = this.networkApi.addConnectionChangeCallback(this.connectionStatusChanged.bind(this));

    this.state = {
      ...defaultState,
      appApi,
      networkApi: this.networkApi,
      connectionStatusChanged: this.connectionStatusChanged.bind(this),
    }

    AsyncStorage.getItem(storageKey)
    .then((lastStateStr: string) => {
      let lastState = {};
      if (lastStateStr) {
        lastState = JSON.parse(lastStateStr);
      }
      //TODO: how to make sure we ARE mounted?
      this.setState({ ...lastState });
      this.state = {
        ...this.state,
        ...lastState,
      }
    })
    .catch((err: Error) => {
      console.log("err", err);
    })
  }

  async componentDidMount()  {
    if (this.state.networkApi) {
      await this.state.networkApi.updateConnectionStatus();
    }
  }

  componentWillUnmount() {
    this.networkApi.removeConnectionChangeCallback(this.connectionChangeCallbackId);
  }



  async persistState() {
    const toSave = {
      //TODO: strip out anything that isn't an object
      isConnected: this.state.isConnected,
    };
    const toSaveStr = JSON.stringify(toSave);

    await AsyncStorage.setItem(storageKey, toSaveStr);
  }

  //
  // Global State-modifying callbacks
  //------------------------------------------------------------------------------

  syncStatusChanged(syncStatus: SyncStatus) {
    this.setState({
      syncStatus
    }, async () => await this.persistState());
  }

  connectionStatusChanged(isConnected: boolean) {
    this.setState({
      isConnected,
    }, async () => await this.persistState());
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