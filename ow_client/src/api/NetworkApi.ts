
import { NetInfo } from 'react-native';

class NetworkApi {
  isConnected: boolean
  connectionUpdateCallbacks: any

  constructor() {
    this.updateConnectionStatus();

    this.isConnected = false;
    this.connectionUpdateCallbacks = {};

    NetInfo.isConnected.addEventListener(
      'connectionChange',
      (isConnected) => this.onConnectionChange(isConnected)
    );
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
        // console.log('isConnected', isConnected);
        this.isConnected = isConnected;
      });
  }

  onConnectionChange(isConnected: boolean) {
    // console.log('Then, is ' + (isConnected ? 'online' : 'offline'));
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