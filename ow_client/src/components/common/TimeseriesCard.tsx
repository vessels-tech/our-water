import * as React from 'react'; import { Component } from 'react';
import {
  Avatar,
  Button,
  Card,
  Text,
} from 'react-native-elements';
import { OWTimeseries } from '../../typings/models/OurWater';


export interface Props {
  timeseries: OWTimeseries,
}

export interface State {

}


/**
 *  TimeseriesCard is a card that displays a timeseries graph,
 *  along with some basic controls for changing the time scale
 */
class TimeseriesCard extends Component<Props> {

}

export default TimeseriesCard;