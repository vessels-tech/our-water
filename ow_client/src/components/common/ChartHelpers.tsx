import * as React from 'react'

import { AnyOrPendingReading } from "../../reducers";
import Svg, { Circle, Line, Rect, Text } from 'react-native-svg'
import * as moment from 'moment';
import { primaryLight, primaryDark } from '../../utils/NewColors';
import { arrayLowest } from '../../utils';


export const Decorator = ({ x, y, data }: { x: any, y: any, data: AnyOrPendingReading[] }) => {
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

export const ShortGrid = ({ x, y, data }: { x: any, y: any, data: AnyOrPendingReading[] }) => {
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

export const ShortGridLabels = ({ x, y, data }: { x: any, y: any, data: AnyOrPendingReading[] }) => {
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