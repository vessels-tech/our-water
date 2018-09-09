import * as React from 'react';
import { Component } from 'react';
import { SyncStatus } from './typings/enums';
import BaseApi from './api/BaseApi';
import { ConfigFactory } from './config/ConfigFactory';
import NetworkApi from './api/NetworkApi';

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

export default class AppProvider extends Component<Props> {
  state: GlobalState = defaultState;

  constructor(props: Props) {
    super(props);
    const appApi = props.config.getAppApi();
    const networkApi = props.config.networkApi;

    //TODO: ask api to trigger first status update now

    //TODO: fix needing userId here...
    appApi.subscribeToPendingReadings('12345', this.syncStatusChanged.bind(this));
    networkApi.addConnectionChangeCallback('app_provider', this.connectionStatusChanged.bind(this));

    this.state = {
      ...defaultState,
      appApi,
      networkApi,
    }
  }

  async componentWillMount()  {
    if (this.state.networkApi) {
      await this.state.networkApi.updateConnectionStatus();
    }
  }

  syncStatusChanged(syncStatus: SyncStatus) {
    this.setState({
      syncStatus
    });
  }

  connectionStatusChanged(isConnected: boolean) {
    console.log("AppProvider: NetworkStatusChanged!");

    this.setState({
      isConnected,
    });
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