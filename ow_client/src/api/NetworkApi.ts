
import { NetInfo } from 'react-native';

export type CallbackMap = {
  [key: string]: any
}

class NetworkApi {
  public isConnected: boolean;
  public connectionUpdateCallbacks: Map<string, any>;

  constructor()  {
    // this.updateConnectionStatus();
    this.isConnected = false;
    this.connectionUpdateCallbacks = new Map<string, any>();

    NetInfo.isConnected.addEventListener(
      'connectionChange',
      (isConnected) => this.onConnectionChange(isConnected)
    );
  }

  public static async createAndInit() {
    const networkApi = new NetworkApi();
    await networkApi.updateConnectionStatus();

    return networkApi;
  }

  addConnectionChangeCallback(id: string, callback: any) {
    this.connectionUpdateCallbacks.set(id, callback);
  }

  removeConnectionChangeCallback(id: string) {
    this.connectionUpdateCallbacks.delete(id);
  }

  updateConnectionStatus() {
    return NetInfo.isConnected.fetch()
      .then(isConnected => {
        console.log('isConnected', isConnected);
        this.isConnected = isConnected;
      });
  }

  onConnectionChange(isConnected: boolean) {
    console.log("isConnected", isConnected);
    console.log('Then, is ' + (isConnected ? 'online' : 'offline'));
    this.isConnected = isConnected;

    Object.keys(this.connectionUpdateCallbacks).forEach(key => {
      let callback = this.connectionUpdateCallbacks.get(key);
      callback(isConnected);
    });
  }

  getIsConnected() {
    return this.isConnected;
  }
}

export default NetworkApi;