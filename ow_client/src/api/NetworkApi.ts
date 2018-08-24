
import { NetInfo } from 'react-native';
import { Component } from 'react';

interface Props {

}

interface State {
  isConnected: boolean,
  connectionUpdateCallbacks: any,
}

class NetworkApi extends Component<Props> {
  state: State;
  // isConnected: boolean
  // connectionUpdateCallbacks: any

  constructor(props: Props) {
    super(props);

    this.state = {
      isConnected: false,
      connectionUpdateCallbacks: {}
    }

    this.updateConnectionStatus();

    NetInfo.isConnected.addEventListener(
      'connectionChange',
      this.onConnectionChange
    );
  }

  addConnectionChangeCallback(id: any, callback: any) {
    const { connectionUpdateCallbacks } = this.state;
    connectionUpdateCallbacks[id] = callback;

    this.setState({connectionUpdateCallbacks});
  }

  removeConnectionChangeCallback(id: any) {
    const { connectionUpdateCallbacks } = this.state;
    delete connectionUpdateCallbacks[id];

    this.setState({ connectionUpdateCallbacks });
  }

  updateConnectionStatus() {
    return NetInfo.isConnected.fetch()
      .then(isConnected => {
        console.log('isConnected', isConnected);
        this.setState({isConnected});
      });
  }

  onConnectionChange(isConnected: boolean) {
    const { connectionUpdateCallbacks } = this.state;

    console.log("isConnected", isConnected);
    console.log('Then, is ' + (isConnected ? 'online' : 'offline'));
    this.setState({ isConnected });

    Object.keys(connectionUpdateCallbacks).forEach(key => {
      let callback = connectionUpdateCallbacks[key];
      callback(isConnected);
    });
  }

  getIsConnected() {
    return this.state.isConnected;
  }
}

export default NetworkApi;