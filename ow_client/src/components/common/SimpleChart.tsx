import * as React from 'react'

//@ts-ignore
import { AreaChart, LineChart, Grid, XAxis, YAxis } from 'react-native-svg-charts'
// import * as shape from 'd3-shape'
import { TimeseriesRange } from '../../typings/models/OurWater';
import { primary, primaryDark, secondary } from '../../utils/Colors';
import { StyleSheet, View } from 'react-native';
import {Moment} from 'moment';
import * as moment from 'moment'
import { AnyReading } from '../../typings/models/Reading';
import { PendingReading } from '../../typings/models/PendingReading';
import { mergePendingAndSavedReadingsAndSort } from '../../utils';
import { AnyOrPendingReading } from '../../reducers';

export type Props = {
  readings: AnyOrPendingReading[],
  pendingReadings: PendingReading[],
  timeseriesRange: TimeseriesRange,
}

export function xLabelForRange(idx: number, dates: Moment[], timeseriesRange: TimeseriesRange) {
  if (dates.length < 8) {
    return dates[idx].format('MMM-YY');
  }

  //We only have space for about 7-8
  const operand = Math.floor(dates.length / 5);
  if (idx % operand !== 0) {
    return '';
  }

  //TODO: change the format depending on how much space we have
  return dates[idx].format('MMM-YY');
}

class SimpleChart extends React.PureComponent<Props> {


  /** 
   * Example of multiple overlapping charts
  render() {
    return (
      <View 
        style={{
          height: '100%',
          flexDirection: 'column',
        }}
      >
        <AreaChart
          style={{ flex: 1 }}
          data={data}
          svg={{ fill: 'rgba(134, 65, 244, 0.5)' }}
          contentInset={{ top: 20, bottom: 20 }}
          // curve={shape.curveNatural}
        >
          <Grid />
        </AreaChart>
        <AreaChart
          style={StyleSheet.absoluteFill}
          data={data2}
          svg={{ fill: 'rgba(34, 128, 176, 0.5)' }}
          contentInset={{ top: 20, bottom: 20 }}
          // curve={shape.curveNatural}
        />
      </View>
    )
  }
  */
  
  render() {
    const { readings, pendingReadings } = this.props;
    
    const contentInset = { top: 20, bottom: 20 };
    const yAxisWidth = 40;

    /* merge together readings, sorted by the creation date */
    // const allReadings = mergePendingAndSavedReadingsAndSort(pendingReadings, readings);
    const allReadings = readings;
    const dates = allReadings.map(r => moment(r.date));
    const values = allReadings.map(r => r.value);

    return (
      <View style={{
        height: '100%',
        flexDirection: 'column',
      }}>
        <View style={{
          flexDirection: 'row',
          flex: 1,
        }}>
          <YAxis 
            style={{
              width: yAxisWidth,
            }}
            data={values}
            contentInset={contentInset}
            svg={{
              fill: primaryDark,
              fontSize: 10,
            }}
            numberOfTicks={5}
            formatLabel={(value: number) => `${value}m`}
          />
          {/* Main Readings */}
          <LineChart
            style={{ 
              flex: 1,
              paddingHorizontal: 2,
            }}
            data={values}
            svg={{ 
              //Ref: https://github.com/react-native-community/react-native-svg#common-props
              stroke: primary,
              strokeWidth: 3
            }}
            contentInset={contentInset}
          >
            <Grid />
          </LineChart>
        </View>
        <XAxis
          style={{
            height: 10,
            // paddingLeft: yAxisWidth,
          }}
          data={values}
          formatLabel={(value: number, idx: number) => xLabelForRange(idx, dates, this.props.timeseriesRange)}
          contentInset={{ left: yAxisWidth, right: 15 }}
          svg={{
            // fill: textDark,
            fontSize: 10,
          }}
        />
      </View>
    )
  }
}

export default SimpleChart;