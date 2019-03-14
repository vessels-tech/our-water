import * as React from 'react'

import { AnyOrPendingReading } from "../../reducers";
import Svg, { Circle, Line, Rect, Text } from 'react-native-svg'
import * as moment from 'moment';
import { primaryLight, primaryDark, surfaceText } from '../../utils/NewColors';
import { arrayLowest } from '../../utils';
//@ts-ignore
import { LineChart, Grid, XAxis, YAxis } from 'react-native-svg-charts'
import { ChartDateOption } from './SimpleChart';



export type ContentInsetType = {
  top: number,
  bottom: number,
  left: number,
  right: number,
}

export const ChartDots = ({ x, y, data }: { x: any, y: any, data: AnyOrPendingReading[] }) => {
  return data.map((value: AnyOrPendingReading, index: number) => (
    <Circle
      key={index}
      cx={x(moment(value.date).toDate())}
      cy={y(value.value)}
      r={4}
      stroke={primaryLight}
      fill={'white'}
    />)
  );
}

export const DateTicks = ({ dateOption, x, y, data }: { dateOption: ChartDateOption, x: any, y: any, data: AnyOrPendingReading[] }) => {
  if (dateOption === ChartDateOption.NoDate) {
    return null;
  }

  const dates = data.map((item) => moment(item.date).toDate());
  const xAxisData = [dates[0], dates[dates.length - 1]];
  const minValue = arrayLowest(data, (r) => r.value);
  const cy = y(minValue.value);

  return xAxisData.map((value: Date, index: number) => (
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
  )
  );
}

export const DateLabels = ({ dateOption,  x, y, data }: {dateOption: ChartDateOption, x: any, y: any, data: AnyOrPendingReading[] }) => {
  if (dateOption === ChartDateOption.NoDate) {
    return null;
  }

  const dates = data.map((item) => moment(item.date).toDate());
  const xAxisData = [dates[0], dates[dates.length - 1]];

  const minValue = arrayLowest(data, (r) => r.value);

  const cy = y(minValue.value) + 15

  return xAxisData.map((value: Date, index: number) => {
    const cx = x(moment(value).toDate());
    let textAnchor: 'middle' | 'start' | 'end' = 'middle';

    return (
      <Text
        fontSize="8"
        key={`${cx}${value}${index}`}
        x={cx}
        y={cy}
        textAnchor={textAnchor}>
        {moment(value).format('DD MMM YY')}
      </Text>
    );
  }
  );
}

export const SimpleYAxis = ({ data, width, contentInset }: { data: AnyOrPendingReading[], width: number, contentInset: ContentInsetType }) => (
  <YAxis
    style={{
      width: width,
    }}
    data={data}
    contentInset={contentInset}
    svg={{
      fill: surfaceText.high,
      fontSize: 10,
    }}
    numberOfTicks={5}
    formatLabel={(value: number) => `${value}m`}
    yAccessor={({ item }: { item: AnyOrPendingReading }) => item.value}
  />
);