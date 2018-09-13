import * as React from 'react'; import { Component } from 'react';
import {
  Avatar,
  Button,
  Card,
  Text,
} from 'react-native-elements';
import { OWTimeseries, Reading } from '../../typings/models/OurWater';
import { View } from 'react-native';
import { textLight } from '../../utils/Colors';


export interface Props {
  timeseries: OWTimeseries,
  initialReadings: Reading[], //The readings initially loaded, this may change if user changes the time scale
}

export interface State {

}


/**
 *  TimeseriesCard is a card that displays a timeseries graph,
 *  along with some basic controls for changing the time scale
 */
class TimeseriesCard extends Component<Props> {

  getGraphView() {

    return (
      <View style={{
        // backgroundColor: 'red',
        flex: 2,
      }}>
        <Text
        >
          TODO: Insert graph
        </Text>
      </View>
    );
  }

  getBottomButtons() {
    return (
      <View style={{
          flex: 1,
          borderColor: textLight,
          borderTopWidth: 2,
          flexDirection: 'row-reverse',
          // backgroundColor: 'pink', 
        }}>
        <Text style={{height: '100%'}}>
          TODO: Insert Buttons
        </Text>
      </View>
    );
  }

  render() {
    const { timeseries: { name } } = this.props;

    return (
      <Card
        containerStyle={{
          width: '90%',
          height: '90%',
        }}
        title={name}>
        <View style={{
          flexDirection: 'column',
          height: '100%',
        }}>
          {this.getGraphView()}
          {this.getBottomButtons()}
        </View>
      </Card>
    )
  }

}

export default TimeseriesCard;