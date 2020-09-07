import moment from 'moment';
import { NetInfo } from 'react-native';

export type CallbackMap = {
  [key: string]: any
}

export interface State {
  isConnected: boolean,
  connectionUpdateCallbacks: Map<string, any>,
}

export default class NetworkApi {
  public isConnected: boolean;
  public connectionUpdateCallbacks: Map<string, any>;

  constructor(state?: State)  {
    if (!state) {
      state = {
        isConnected: false,
        connectionUpdateCallbacks: new Map<string, any>(),
      }
    }
    this.isConnected = state.isConnected;
    this.connectionUpdateCallbacks = state.connectionUpdateCallbacks;

    NetInfo.isConnected.addEventListener(
      'connectionChange',
      (isConnected) => this.onConnectionChange(isConnected)
    );
  }

  public static async createAndInit() {
    const networkApi = new NetworkApi();
    // await networkApi.updateConnectionStatus();

    return networkApi;
  }

  addConnectionChangeCallback(callback: any): string {
    const id = `${moment().valueOf()}`;
    this.connectionUpdateCallbacks.set(id, callback);
    return id;
  }

  removeConnectionChangeCallback(id: string) {
    this.connectionUpdateCallbacks.delete(id);
  }

  updateConnectionStatus() {
    return NetInfo.isConnected.fetch()
      .then(isConnected => {
        this.onConnectionChange(isConnected);
      });
  }

  private onConnectionChange(isConnected: boolean) {
    const keys = [ ...this.connectionUpdateCallbacks.keys() ];
    keys.forEach(key => {
      let callback = this.connectionUpdateCallbacks.get(key);
      callback(isConnected);
    });
  }

  // getIsConnected() {
  //   return this.isConnected;
  // }
}
