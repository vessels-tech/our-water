import * as React from 'react'

import { AnyOrPendingReading } from "../../reducers";
import Svg, { Circle, Line, Rect, Text, G } from 'react-native-svg'
import * as moment from 'moment';
import { primaryLight, primaryDark, surfaceText, secondaryDark, secondaryPallette } from '../../utils/NewColors';
import { arrayLowest } from '../../utils';
//@ts-ignore
import { LineChart, Grid, XAxis, YAxis } from 'react-native-svg-charts'
import { ChartDateOption } from './SimpleChart';
import { date } from 'react-native-joi';
import { TimeseriesRange } from '../../typings/models/OurWater';
import TimeseriesSummaryText from './TimeseriesSummaryText';



export type ContentInsetType = {
  top: number,
  bottom: number,
  left: number,
  right: number,
}

export interface GenericProps {
  x: any,
  y: any, 
  data: AnyOrPendingReading[],
  timeseriesRange: TimeseriesRange,
  strictMode: boolean,
}

export interface YAxisProps {
  unitOfMeasure: string,
}

export interface DateTicksProps {
  dateOption: ChartDateOption, 
}

export interface VerticalGridProps {
  dateOption: ChartDateOption, 
}

export interface DateLabelProps {
  dateOption: ChartDateOption, 
}


/**
 * Chunks readings together based on one year intervals
 */
export const calculateOneYearChunkedReadings = (readings: AnyOrPendingReading[]): Array<Array<AnyOrPendingReading>> => {
  const chunks: Array<Array<AnyOrPendingReading>> = [[], [], []];
  const pairs = chunks.map((_, idx) => {
    const end = moment().subtract(idx, 'year');
    const start = end.clone().subtract(1, 'year');
    return { end, start };
  });
  readings.forEach(r => {
    pairs.forEach((pair, idx) => {
      if (moment(r.date).isBetween(pair.start, pair.end)) {
        const clonedReading: AnyOrPendingReading = JSON.parse(JSON.stringify(r));
        clonedReading.date = moment(clonedReading.date).add(idx, 'year').toISOString();
        chunks[idx].push(clonedReading);
      }
    });
  });

  return chunks;
}

/**
 * getMinAndMaxValues
 * 
 * Get the minimum and maximum values for the set of readings.
 */
export const getMinAndMaxValues = (readings: AnyOrPendingReading[]): {min: number, max: number} => {
  let min = Number.MAX_SAFE_INTEGER;
  let max = 0;

  //If readings only has one reading, add some decent padding
  if (readings.length === 0) {
    return {
      min: 0,
      max: 100,
    }
  }

  if (readings.length === 1) {
    const r = readings[0];
    return {
      min: 0,
      max: r.value + 15,
    }
  }

  readings.forEach(r => {
    if (r.value > max) {
      max = r.value;
    }

    if (r.value < min) {
      min = r.value;
    }
  });


  return { 
    min, 
    max
  };
}


/**
 * getDatesForDataAndDistribution
 * @param data 
 * @param dateOption 
 * @param timeseriesRange - TimeseriesRange the timeseries range for the dates. Ignored if strictMode is false
 * @param strictMode - boolean. If true, then will return strictly the dates for the given timeseries range, relative to now
 */
export const getDatesForDataAndDistribution = (
  data: AnyOrPendingReading[], 
  dateOption: ChartDateOption, 
  timeseriesRange: TimeseriesRange,
  strictMode: boolean): Date[] => {

  if (dateOption === ChartDateOption.NoDate) {
    return []
  }

  let dates = data.map((item) => moment(item.date).toDate());
  if (strictMode) {
    if (timeseriesRange === TimeseriesRange.ONE_YEAR || TimeseriesRange.THREE_YEARS) {
      const lastDate = moment().toDate();
      const firstDate = moment().subtract(1, 'year').toDate();
      dates = [firstDate, lastDate];
    }

    if (timeseriesRange === TimeseriesRange.THREE_MONTHS) {
      const lastDate = moment().toDate();
      const firstDate = moment().subtract(3, 'months').toDate();
      dates = [firstDate, lastDate];
    }
  }

  if (dateOption === ChartDateOption.FirstAndLast) {
    return [dates[0], dates[dates.length - 1]];
  }

  //Find 3 dates inbetween first and last
  const firstUnix = dates[0].valueOf();
  const lastUnix = dates[dates.length - 1].valueOf();
  const diff = lastUnix - firstUnix;
  const datesCount = 4
  const step = diff / datesCount;
  const finalDates = [];
  for (let i = firstUnix; i <= lastUnix; i += step ) {
    const tweenDate = new Date(i);
    finalDates.push(tweenDate);
  }

  return finalDates;
}

export const getValuesForDataAndDistribution = (data: AnyOrPendingReading[], ticks: number): number[] => {
  if (ticks === 0) {
    throw new Error("ticks must be above 0");
  }
  const { min, max } = getMinAndMaxValues(data);
  const diff = max - min;
  const step = Math.ceil(diff/ticks);
  const values = [];

  for (let i = min; i <= max; i+= step) {
    values.push(i);
  }
  
  return values
}


export const ChartDots = (props: { x: any, y: any, data: AnyOrPendingReading[] }) => {
  const { x, y, data } = props;

  return data.map((value: AnyOrPendingReading, index: number) => (
    <Circle
      key={index}
      cx={x(moment(value.date).toDate())}
      cy={y(value.value)}
      r={4}
      stroke={secondaryPallette._800}
      fill={'white'}
    />)
  );
}

export const DateTicks = (props: GenericProps & DateTicksProps) => {
  const { dateOption, x, y, data } = props;

  let height = 5;
  const { min } = getMinAndMaxValues(data);
  let cy = y(min);

  const xAxisData = getDatesForDataAndDistribution(data, dateOption, props.timeseriesRange, props.strictMode);
  return xAxisData.map((value: Date, index: number) => (
    <Rect
      key={`${value}${index}`}
      x={x(moment(value).toDate())}
      y={cy}
      width={1}
      height={height}
      fill={surfaceText.med}
      strokeWidth={1}
      stroke={surfaceText.med}
    />
  ));
}

export const VerticalGrid = (props: GenericProps & VerticalGridProps) => {
  const { dateOption, x, y, data } = props;
  const xAxisData = getDatesForDataAndDistribution(data, dateOption, props.timeseriesRange, props.strictMode);
  const { min, max } = getMinAndMaxValues(data);

  return xAxisData.map((value: Date, index: number) => (
    <Line
      key={`${value}${index}`}
      y1={y(max)}
      y2={y(min)}
      x1={x(moment(value).toDate())}
      x2={x(moment(value).toDate())}
      strokeWidth={1}
      stroke={'rgba(0,0,0,0.2)'}
    />
  ));
}

export const DateLabels = (props: GenericProps & DateLabelProps) => {
  const { dateOption, x, y, data } = props;
  const xAxisData = getDatesForDataAndDistribution(data, dateOption, props.timeseriesRange, props.strictMode);
  const { min } = getMinAndMaxValues(data);
  let cy = y(min) + 15;

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

/**
 * Custom y axis labels object
 */
export const YAxisLabels = (props: GenericProps & YAxisProps) => {
  const { x, y, data, unitOfMeasure } = props;
  const yAxisData = getValuesForDataAndDistribution(data, 5);

  return (
    <G>
      {
        yAxisData.map((value, idx) => {
          const yVal = y(value) + 2

          return (
            <Text
              fontSize="8"
              key={`${value}${idx}${yVal}`}
              x={0}
              y={yVal}
              textAnchor={'start'}>
              {value} {unitOfMeasure}
            </Text>
          );
        })
      }
    </G>
  );
}

/**
 * Custom horizontal grid 
 */
export const HorizontalGrid = (props: GenericProps) => {
  const { y, data } = props;
  const yAxisData = getValuesForDataAndDistribution(data, 5);

  return (
    <G>
      {
        yAxisData.map((value, idx) => {
          return (
            <Line
              key={`${value}${idx}`}
              x1={'5%'}
              x2={'95%'}
              y1={y(value)}
              y2={y(value)}
              strokeWidth={1}
              stroke={'rgba(0,0,0,0.2)'}
            />
          );
        })
      }
    </G>
  );
}

export const SimpleYAxis = ({ data, width, contentInset }: { data: AnyOrPendingReading[], width: number, contentInset: ContentInsetType }) => {
  // const testData = [0, 5, 10, 15, 20, 25];

  return (
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
      formatLabel={(value: number) => `${value}`}
      // yAccessor={({ item }: { item: AnyOrPendingReading }) => item.value}
      yAccessor={(val: number) => val}
    />
  )
};

export const strokeForIndex = (idx: number): string => {
  const colors = [
    secondaryDark,
    "#735D9B",
    "#77B79F",
  ];
  const remainder = idx % colors.length;
  return colors[remainder];
}

export const strokeOpacityForIndex = (idx: number, total: number): number => {
  if (total === 0) {
    total = 1;
  }

  const max = 1;
  const min = 0;
  const diff = (max - min)/total;

  const opacity = max - (idx * diff);
  return opacity;
}