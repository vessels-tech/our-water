import * as React from 'react'

//@ts-ignore
import { LineChart, Grid, XAxis, YAxis } from 'react-native-svg-charts'
// import * as shape from 'd3-shape'
import { TimeseriesRange } from '../../typings/models/OurWater';
import { primary, primaryDark, secondary, primaryLight } from '../../utils/Colors';
import { View } from 'react-native';
import * as moment from 'moment'
import { PendingReading } from '../../typings/models/PendingReading';
import { AnyOrPendingReading } from '../../reducers';
import * as scale from 'd3-scale';
import { Circle, Line, Rect } from 'react-native-svg'
import { arrayLowest } from '../../utils';

export type Props = {
  readings: AnyOrPendingReading[],
  pendingReadings: PendingReading[],
  timeseriesRange: TimeseriesRange,
}

export function xLabelForRange(idx: number, dates: Date[], timeseriesRange: TimeseriesRange) {
  if (dates.length < 8) {
    return moment(dates[idx]).format('DD-MMM-YY');
  }

  //We only have space for about 7-8
  const operand = Math.floor(dates.length / 5);
  if (idx % operand !== 0) {
    return '';
  }

  //TODO: change the format depending on how much space we have
  return moment(dates[idx]).format('MMM-YY');
}

const Decorator = ({ x, y, data }: { x: any, y: any, data: AnyOrPendingReading[]}) => {
  return data.map((value: AnyOrPendingReading, index: number) => 
    <Circle
      key={index}
      cx={x(moment(value.date).toDate())}
      cy = { y(value.value)}
      r={4}
      stroke={primaryLight}
      fill={'white'}
    />
  );
}

const ShortGrid = ({ x, y, data }: { x: any, y: any, data: AnyOrPendingReading[]}) => {
  const dates = data.map((item) => moment(item.date).toDate());
  const xAxisData = scale.scaleTime().domain([dates[0], dates[dates.length - 1]]).ticks(5);
  const minValue = arrayLowest(data, (r) => r.value);
  const cy = y(minValue.value);

  return xAxisData.map((value: Date, index: number) => 
    <Rect
      key={`${value}`}
      x={x(moment(value).toDate())}
      y={cy}
      width={1}
      height={5}
      fill={primaryDark}
      strokeWidth={0}
      stroke="rgb(0,0,0)"
    />
  );
}

class SimpleChart extends React.PureComponent<Props> {


  render() {
    const { readings } = this.props;
    
    const contentInset = { top: 5, bottom: 20, left: 10, right: 10 };
    const yAxisWidth = 40;
    const dates = readings.map((item) => moment(item.date).toDate());
    const xAxisData = scale.scaleTime().domain([dates[0], dates[dates.length - 1]]).ticks(5);

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
            data={readings}
            contentInset={contentInset}
            svg={{
              fill: primaryDark,
              fontSize: 10,
            }}
            numberOfTicks={5}
            formatLabel={(value: number) => `${value}m`}
            yAccessor={({ item }: { item: AnyOrPendingReading }) => item.value}
          />
          {/* Main Readings */}
          <LineChart
            style={{ 
              flex: 1,
              paddingHorizontal: 2,
            }}
            data={readings}
            yAccessor={({item}: {item: AnyOrPendingReading}) => item.value}
            xAccessor={({item}: {item: AnyOrPendingReading}) => moment(item.date).toDate()}
            svg={{ 
              //Ref: https://github.com/react-native-community/react-native-svg#common-props
              stroke: primary,
              strokeWidth: 3
            }}
            contentInset={contentInset}
            xScale={ scale.scaleTime }
          >
            <Grid />
            <Decorator />
            <ShortGrid />
          </LineChart>
        </View>
        <XAxis
          style={{
            height: 10,
          }}
          data={xAxisData}
          formatLabel={(idx: number, value: any) => {
            const date = xAxisData[idx];
            // console.log('format label', idx, value);
            return moment(date).format('DD-MMM-YY')
          }}
          contentInset={{ left: 30 + yAxisWidth, right: 20 }}
          svg={{
            fontSize: 8,
          }}
          scale={ scale.scaleTime }
        />
      </View>
    )
  }
}

export default SimpleChart;