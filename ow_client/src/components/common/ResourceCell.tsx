import * as React from 'react'; import { Component } from 'react';
import { randomPrettyColorForId, formatShortId, getShortIdOrFallback } from '../../utils';
import { DeprecatedResource } from '../../typings/models/OurWater';
import { View, Dimensions } from 'react-native';
import { Button } from 'react-native-elements';
import { secondaryText } from '../../utils/Colors';
import { ActionMeta } from '../../typings/Reducer';
import { connect } from 'react-redux'
import * as appActions from '../../actions/index';
import { AppState } from '../../reducers';
import BaseApi from '../../api/BaseApi';
import { ConfigFactory } from '../../config/ConfigFactory';
import { ResultType } from '../../typings/AppProviderTypes';
import { AnyResource } from '../../typings/models/Resource';

const SCREEN_WIDTH = Dimensions.get('window').width;


export interface OwnProps {
  config: ConfigFactory,
  resource: AnyResource,
  onResourceCellPressed: (resource: AnyResource) => void,
  style: any,

}

export interface StateProps {
  shortIdMeta?: ActionMeta,
  shortId?: string,
}

export interface ActionProps {
  getShortId: (api: BaseApi, resourceId: string) => void,

}


class ResourceCell extends Component<OwnProps & StateProps & ActionProps> {
  constructor(props: OwnProps & StateProps & ActionProps) {
    super(props);

    //if we have no shortId, ask for it
    this.props.getShortId(this.props.config.appApi, this.props.resource.id);

    //Binds
    // this.onResourceCellPressed = this.onResourceCellPressed.bind(this);
  }

  // onResourceCellPressed() {
  //   // this.props.onResourceCellPressed(this.props.resource);
  // }


  render() {
    const { resource, shortId, shortIdMeta } = this.props;

    const backgroundColor = randomPrettyColorForId(resource.id);

    let title;
    if (!shortIdMeta || shortIdMeta.loading === true || !shortId) {
      title = ' . . . '
    } else {
      const titleResult = formatShortId(shortId);
      if (titleResult.type === ResultType.ERROR) {
        title = ' . . . '
      } else {
        title = titleResult.result;
      }
    }

    return (
      <View style={{
        margin: 0,
        // marginBottom: 15,
        // width: 140,
        ...this.props.style,
      }}
        key={resource.id}
      >
        <Button
          raised={true}
          key={resource.id}
          title={title}
          // title={`${getShortId(resource.id)}`}
          color={secondaryText}
          buttonStyle={{
            backgroundColor,
            // borderRadius: 5,
          }}
          // titleStyle={{
          //   fontWeight: 'bold', 
          //   fontSize: 23,
          // }}
          onPress={() => this.props.onResourceCellPressed(this.props.resource)}
          underlayColor="transparent"
        />
      </View>
    );
  }

}

const mapStateToProps = (state: AppState, props: OwnProps) => {
  const allShortIdsMeta = state.shortIdMeta;
  // let shortIdMeta: ActionMeta = 
  let shortIdMeta = state.shortIdMeta.get(props.resource.id);
  let shortId = state.shortIdCache.get(props.resource.id);

  //TODO: handle case wher

  return {
    shortIdMeta,
    shortId
  }
}

const mapDispatchToProps = (dispatch: any) => {
  return {
    // addRecent: (api: BaseApi, userId: string, resource: Resource) => {
    //   dispatch(appActions.addRecent(api, userId, resource))
    // },
    getShortId: (api: BaseApi, resourceId: string) => {
      dispatch(appActions.getShortId(api, resourceId))
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ResourceCell);