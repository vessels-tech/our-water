import * as React from 'react'; import { Component } from 'react';
import { randomPrettyColorForId, formatShortId } from '../../utils';
import { View, Dimensions } from 'react-native';
import { Button, Badge } from 'react-native-elements';
import { secondaryText } from '../../utils/Colors';
import { ActionMeta } from '../../typings/Reducer';
import { connect } from 'react-redux'
import * as appActions from '../../actions/index';
import { AppState } from '../../reducers';
import BaseApi from '../../api/BaseApi';
import { ConfigFactory } from '../../config/ConfigFactory';
import { ResultType } from '../../typings/AppProviderTypes';
import { AnyResource } from '../../typings/models/Resource';
import { OrgType } from '../../typings/models/OrgType';
import { primaryText } from '../../assets/ggmn/Colors';
import { PendingResource } from '../../typings/models/PendingResource';
import { isNullOrUndefined } from 'util';


export interface OwnProps {
  config: ConfigFactory,
  resource: AnyResource | PendingResource,
  onResourceCellPressed: (resource: AnyResource | PendingResource) => void,
  style: any,

}

export interface StateProps {
  shortIdMeta?: ActionMeta,
  shortId?: string,
  isNew: boolean,
}

export interface ActionProps {
  getShortId: (api: BaseApi, resourceId: string) => void,
}


class ResourceCell extends Component<OwnProps & StateProps & ActionProps> {
  constructor(props: OwnProps & StateProps & ActionProps) {
    super(props);

    if (this.props.config.getUsesShortId()) {
      //if we have no shortId, ask for it
      this.props.getShortId(this.props.config.appApi, this.props.resource.id); 
    }
  }

  getTitle() {
    const { resource, shortId, shortIdMeta } = this.props;

    if (resource.type === OrgType.GGMN) {
      //GGMN uses the name field
      return resource.name;
    }

    if (!this.props.config.getUsesShortId()) {
      return resource.id;
    }

    if (!shortIdMeta || shortIdMeta.loading === true || !shortId) {
      return '. . . - . . .';
    } 
    
    const titleResult = formatShortId(shortId);
    if (titleResult.type === ResultType.ERROR) {
      return '. . . - . . .';
    }

    return titleResult.result;
  }

  render() {
    const { resource, isNew } = this.props;

    const backgroundColor = randomPrettyColorForId(resource.id);

    return (
      <View style={{
        marginVertical: 10,
        // margin: 0,
        ...this.props.style,
      }}
        key={resource.id}
      >
        <View
          style={{
            height: 50,
            zIndex: 1,
          }}
        >
          <Button
            borderRadius={5}
            raised={true}
            key={resource.id}
            title={this.getTitle()}
            color={secondaryText}
            buttonStyle={{
              backgroundColor,
            }}
            textStyle={{
              color: secondaryText,
              fontWeight: '600'
            }}
            onPress={() => this.props.onResourceCellPressed(this.props.resource)}
            underlayColor="transparent"
          />
        
        </View>
        {
          isNew &&
          <Badge
            containerStyle={{ marginBottom: 20, zIndex: 2, backgroundColor: 'orange', position: 'absolute', bottom: 20, right: 0 }}
            value={"New!"}
            textStyle={{ fontSize: 8, fontWeight: '300' }}
          />
        }
        
      </View>
    );
  }

}

const mapStateToProps = (state: AppState, props: OwnProps) => {
  let shortIdMeta = state.shortIdMeta[props.resource.id];
  let shortId = state.shortIdCache[props.resource.id];
  let isNew = !isNullOrUndefined(state.newResources[props.resource.id]);

  return {
    shortIdMeta,
    shortId,
    isNew,
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