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
//@ts-ignore
import * as scale from 'd3-scale';
import Svg, { Circle, Line, Rect, Text } from 'react-native-svg'
import { arrayLowest } from '../../utils';
import { RemoteConfigDeveloperMode } from '../../utils/EnvConfig';
import { Decorator, ShortGridLabels, ShortGrid } from './ChartHelpers';

export type Props = {
  readings: AnyOrPendingReading[],
  pendingReadings: PendingReading[],
  timeseriesRange: TimeseriesRange,
}

export type ContentInsetType = {
  top: number,
  bottom: number,
  left: number,
  right: number,
}

const SimpleYAxis = ({ data, width, contentInset }: { data: AnyOrPendingReading[], width: number, contentInset: ContentInsetType}) => (
  <YAxis
    style={{
      width: width,
    }}
    data={data}
    contentInset={contentInset}
    svg={{
      fill: primaryDark,
      fontSize: 10,
    }}
    numberOfTicks={5}
    formatLabel={(value: number) => `${value}m`}
    yAccessor={({ item }: { item: AnyOrPendingReading }) => item.value}
  />
);


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
          <SimpleYAxis
            data={readings}
            width={yAxisWidth}
            contentInset={contentInset}
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
            xScale={scale.scaleTime}
          >
            <Grid/>
            <Decorator/>
            <ShortGrid/>
            <ShortGridLabels/>
          </LineChart>
        </View>
      </View>
    )
  }
}

export default SimpleChart;