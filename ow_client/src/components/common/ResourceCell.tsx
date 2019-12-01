import * as React from 'react'; import { Component } from 'react';
import { randomPrettyColorForId, formatShortId } from '../../utils';
import { View, TouchableNativeFeedback } from 'react-native';
import { Button, Badge, Text } from 'react-native-elements';
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
import { PendingResource } from '../../typings/models/PendingResource';
import { isNullOrUndefined } from 'util';
import * as Animatable from 'react-native-animatable';

import withPreventDoubleClick from './withPreventDoubleClick';
import { surfaceText } from '../../utils/NewColors';
import { TranslationFile } from 'ow_translations/src/Types';
const TouchableNativeFeedbackEx = withPreventDoubleClick(TouchableNativeFeedback);

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
  translation: TranslationFile,
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

  getTitleOrAnimation() {
    if (!this.props.config.getUsesShortId() || (this.props.shortIdMeta && !this.props.shortIdMeta.loading)) {
      return (
        <Text
          style={{
            fontSize: 17,
            fontWeight: 'bold',
            color: surfaceText.high
          }}
        >
          {this.getTitle()}
        </Text>
      );
    }

    return (
      <Animatable.View 
        animation="flash" 
        iterationCount="infinite" 
        easing='linear' 
        direction="reverse"
        duration={2500}
      >
        <View style={{
          backgroundColor: 'black',
          opacity: 0.5,
          marginVertical: 5,
          marginHorizontal: 12,
          width: 60,
          height: 20,
        }}
        />
      </Animatable.View>
    )
  }

  render() {
    const { resource, isNew } = this.props;
    const {
      new_label,
    } = this.props.translation.templates;
    const backgroundColor = randomPrettyColorForId(resource.id);

    return (
      <View style={{
      }}
        key={resource.id}
      >
        <View
          style={{
            zIndex: 1,
          }}
        >
          <TouchableNativeFeedbackEx
            onPress={() => this.props.onResourceCellPressed(this.props.resource)}
          >
            <View
              style={{
                borderRadius: 5,
                padding: 10,
                margin: 10,
                height: 50,
                width: 88,
                backgroundColor,
                alignItems: 'center',
                justifyContent: 'center',
                elevation: 3,
              }}
            >
            {this.getTitleOrAnimation()}
          </View>
          </TouchableNativeFeedbackEx>
        </View>
        {
          isNew &&
          <Badge
            containerStyle={{ marginBottom: 25, zIndex: 2, backgroundColor: 'orange', position: 'absolute', bottom: 25, right: 0 }}
            value={new_label}
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
    translation: state.translation,
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