import * as React from 'react'; import { Component } from 'react';
import { Callout } from "react-native-maps";
import { AnyResource } from "../../typings/models/Resource";
import { PendingReading } from "../../typings/models/PendingReading";
import { PendingResource } from "../../typings/models/PendingResource";
import { View } from 'react-native';
import { randomPrettyColorForId, getShortIdOrFallback, getGroundwaterAvatar } from '../../utils';
import { Text, Avatar, Icon } from 'react-native-elements';
import { ResourceType } from '../../enums';
import { OrgType } from '../../typings/models/OrgType';
import { CacheType } from '../../reducers';

export interface Props {
  resource: AnyResource | PendingResource, 
  onCalloutPressed: (resource: AnyResource | PendingResource) => any,
  shortIdCache: CacheType<string>, //resourceId => shortId
}

export interface State {

}

export default class MapCallout extends React.PureComponent<Props, State> {
 
  render() {
    const { onCalloutPressed, resource } = this.props;
    const shortId = getShortIdOrFallback(resource.id, this.props.shortIdCache, ' . . . ');

    let avatarText = "";
    if (resource.pending || resource.type === OrgType.MYWELL) {
      avatarText = resource.resourceType.charAt(0);
    }

    return (
      <Callout
        onPress={() => onCalloutPressed(resource)}
        tooltip
      >
        <View style={{
          flex: 1,
          padding: 10,
          margin: 10,
          backgroundColor: randomPrettyColorForId(resource.id),
          flexDirection:'row',
          shadowOffset: { width: 10, height: 10, },
          shadowColor: 'black',
          shadowOpacity: 1.0,
        }}>
          <Avatar
            containerStyle={{
              alignSelf: 'center',
              marginRight: 10,
            }}
            rounded
            small
            title={avatarText}
            activeOpacity={0.7}
          />
          <Text style={{ fontWeight: '800', fontSize: 20, alignSelf: 'center',  }}>{`${shortId}`}</Text>
          <Icon
            size={20}
            name={'chevron-right'}
            // color={secondaryText}
            // iconStyle={{
              // color: secondaryText,
            // }}
          />
        </View>
      </Callout>
    )
  }
}