
import { NetInfo } from 'react-native';

class NetworkApi {
  public isConnected: boolean
  public connectionUpdateCallbacks: any

  constructor()  {
    // this.updateConnectionStatus();
    this.isConnected = false;
    this.connectionUpdateCallbacks = {};

    NetInfo.isConnected.addEventListener(
      'connectionChange',
      this.onConnectionChange
    );
  }

  public static async createAndInit() {
    const networkApi = new NetworkApi();
    await networkApi.updateConnectionStatus();

    return networkApi;
  }

  addConnectionChangeCallback(id: any, callback: any) {
    this.connectionUpdateCallbacks[id] = callback;
  }

  removeConnectionChangeCallback(id: any) {
    delete this.connectionUpdateCallbacks[id];
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
      let callback = this.connectionUpdateCallbacks[key];
      callback(isConnected);
    });
  }

  getIsConnected() {
    return this.isConnected;
  }
}

export default NetworkApi;