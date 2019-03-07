import * as React from 'react';
import { Component } from 'react';
import { debounced } from '../../utils';

const waitTime = 150;

interface Props {
  onPress: () => void,
  [index: string]: any,
}

const withPreventDoubleClick = (WrappedComponent: any) => {

  class PreventDoubleClick extends React.PureComponent<Props> {
    public displayName: string = "";

    constructor(props: Props) {
      super(props);

      this.onPress = debounced(waitTime, this.props.onPress);
    }

    onPress = () => {
      this.props.onPress && this.props.onPress();
    }

    render() {
      return <WrappedComponent {...this.props} onPress={this.onPress} />;
    }
  }

  PreventDoubleClick.displayName = `withPreventDoubleClick(${WrappedComponent.displayName || WrappedComponent.name})`
  return PreventDoubleClick;
}

export default withPreventDoubleClick;