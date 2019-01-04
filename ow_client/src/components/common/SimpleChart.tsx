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
import Svg, { Circle, Line, Rect, Text } from 'react-native-svg'
import { arrayLowest } from '../../utils';

export type Props = {
  readings: AnyOrPendingReading[],
  pendingReadings: PendingReading[],
  timeseriesRange: TimeseriesRange,
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
  // const xAxisData = scale.scaleTime().domain([dates[0], dates[dates.length - 1]]).ticks(3);
  const xAxisData = [dates[0], dates[dates.length -1]];
  const minValue = arrayLowest(data, (r) => r.value);
  const cy = y(minValue.value);

  return xAxisData.map((value: Date, index: number) => 
      <Rect
        key={`${value}${index}`}
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

const ShortGridLabels = ({ x, y, data }: { x: any, y: any, data: AnyOrPendingReading[]}) => {
  const dates = data.map((item) => moment(item.date).toDate());
  // const xAxisData = scale.scaleTime().domain([dates[0], dates[dates.length - 1]]).ticks(4);
  const xAxisData = [dates[0], dates[dates.length - 1]];

  const minValue = arrayLowest(data, (r) => r.value);
  
  const cy = y(minValue.value) + 15

  return xAxisData.map((value: Date, index: number) => {
    const cx = x(moment(value).toDate());
    let textAnchor: 'middle' | 'start' | 'end' = 'middle';
    // if (index === 0) {
    //   textAnchor = 'start';
    // }
    // if (index === xAxisData.length - 1) {
    //   textAnchor = 'end'
    // }

    return (
      <Text
        fontSize="8"
        key={`${value}${index}`}
        x={cx}
        y={cy}
        textAnchor={textAnchor}>
        {moment(value).format('DD MMM YY')}
      </Text>
    );
    }
  );
}

class SimpleChart extends React.PureComponent<Props> {

  render() {
    const { readings } = this.props;    
    const contentInset = { top: 5, bottom: 20, left: 20, right: 20 };
    const yAxisWidth = 40;

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
            <ShortGridLabels />
          </LineChart>
        </View>
      </View>
    )
  }
}

export default SimpleChart;