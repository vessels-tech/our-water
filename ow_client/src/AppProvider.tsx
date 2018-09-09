import * as React from 'react';
import { Component } from 'react';
import { SyncStatus } from './typings/enums';

/**
 * App provider uses the React Context api to manage any global state.
 */

export interface Props {};

export interface GlobalState {
  syncStatus: SyncStatus, // the status of any syncs that OW needs to make
  connectionStatus: boolean, //are we connected to the internets? 

  //Functions
  syncStatusChanged?: any,



  //TODO: 
  //pendingReadings
  //userId
  //isConnectedExternally
  //language and region
}

const defaultState: GlobalState = {
  syncStatus: 'none',
  connectionStatus: false,
}

export const AppContext = React.createContext(defaultState);

export default class AppProvider extends Component<Props> {
  state: GlobalState = defaultState;

  constructor(props: Props) {
    super(props);
  }

  // //Actions here?
  syncStatusChanged(syncStatus: SyncStatus) {
    this.setState({
      syncStatus
    });
  }



   render() {
     //TODO: not sure what the problem is here.
     return (
       <AppContext.Provider
         value={{
           ...this.state,
           syncStatusChanged: this.syncStatusChanged
         }}>
         {this.props.children}
       </AppContext.Provider>
     );
   }
}