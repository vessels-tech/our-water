import * as React from 'react';
import { Component } from "react";
import { ListItem, Icon } from "react-native-elements";
import { TouchableNativeFeedback } from "react-native";
import { PendingReading } from '../../typings/models/PendingReading';
import { error1, primaryDark } from '../../utils/Colors';
import moment = require('moment');
import { getReadingAvatar, hashCode } from '../../utils';

export interface Props {
  deletePendingReading: (id: string) => any,
  pendingReading: PendingReading,
  sync_date_format: string,
  errorMessage?: string,
  message?: string,
  unitSuffix?: string,
}

export default function ReadingListItem(props: Props) {
  const { unitSuffix } = props;

  const {
    resourceId,
    timeseriesId,
    date,
    value,
  } = props.pendingReading;


  return (
    <ListItem
      containerStyle={{
        paddingLeft: 6,
      }}
      roundAvatar={true}
      rightIcon={
        <TouchableNativeFeedback
          onPress={() => props.deletePendingReading(props.pendingReading.id)}
        >
          <Icon
            name='close'
            color={error1}
          />
        </TouchableNativeFeedback>
      }
      title={`${moment(date).format(props.sync_date_format)}: ${value}${unitSuffix ? unitSuffix : ''}`}
      avatar={getReadingAvatar()}
      subtitle={props.errorMessage || `${resourceId}, ${timeseriesId}`}
      subtitleStyle={{ color: props.message ? error1 : primaryDark }}
    />
  );

}