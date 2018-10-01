import * as React from 'react'

//@ts-ignore
import { LineChart, Grid, XAxis, YAxis } from 'react-native-svg-charts'
import { TimeseriesRange, Reading } from '../../typings/models/OurWater';
import { primary, primaryDark, textDark } from '../../utils/Colors';
import { View } from 'react-native';
import {Moment} from 'moment';
import * as moment from 'moment'

export type Props = {
  readings: Reading[],
  timeseriesRange: TimeseriesRange
}

export function xLabelForRange(idx: number, dates: Moment[], timeseriesRange: TimeseriesRange) {
  //We only have space for about 7-8
  const operand = Math.floor(dates.length / 5);
  if (idx % operand !== 0) {
    return '';
  }

  //TODO: change the format depending on how much space we have
  return dates[idx].format('MMM-YY');
}

class SimpleChart extends React.PureComponent<Props> {
  
  render() {
    const { readings } = this.props;
    const contentInset = { top: 20, bottom: 20 };

    const values = readings.map(r => r.value);
    const dates = readings.map(r => moment(r.date));
    const yAxisWidth = 40;

    return (
      <View style={{
        height: '100%',
        flexDirection: 'column',
      }}>
        <View style={{
          flexDirection: 'row',
          flex: 1,
          // padding: 20,
        }}>
          <YAxis 
            style={{
              width: yAxisWidth,
            }}
            data={values}
            contentInset={contentInset}
            svg={{
              fill: textDark,
              fontSize: 10,
            }}
            numberOfTicks={10}
            formatLabel={(value: number) => `${value}m`}
          />
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