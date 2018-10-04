#OW_CLIENT

The react native app for OurWater



## Component Template:

```js
import * as React from 'react';
import { Component } from 'react';
import { connect } from 'react-redux'
import { AppState } from '../reducers';
import * as appActions from '../actions/index';



export interface OwnProps {

}

export interface StateProps {

}

export interface ActionProps {

}


export interface State {

}

class ClassName extends Component<OwnProps & StateProps & ActionProps> {
  state: State = {

  };

  constructor(props: OwnProps & StateProps & ActionProps) {
    super(props);
  }

  render() {
    return null;
  }
}

const mapStateToProps = (state: AppState, ownProps: OwnProps): StateProps => {
  
  return {

  }
}

const mapDispatchToProps = (dispatch: any): ActionProps => {
  return {
    // addRecent: (api: BaseApi, userId: string, resource: Resource) => {
      // dispatch(appActions.addRecent(api, userId, resource))
    // },
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ClassName);
```