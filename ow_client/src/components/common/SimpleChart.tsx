import * as React from 'react'

//@ts-ignore
import { LineChart, Grid, XAxis, YAxis } from 'react-native-svg-charts'
// import * as shape from 'd3-shape'
import { TimeseriesRange } from '../../typings/models/OurWater';
import { View, StyleSheet, StyleProp, TextStyle } from 'react-native';
import * as moment from 'moment'
import { PendingReading } from '../../typings/models/PendingReading';
import { AnyOrPendingReading } from '../../reducers';
//@ts-ignore
import * as scale from 'd3-scale';
import { ChartDots, SimpleYAxis, ContentInsetType, DateTicks, DateLabels, VerticalGrid, getDatesForDataAndDistribution, YAxisLabels, getMinAndMaxValues, HorizontalGrid, strokeForIndex, strokeOpacityForIndex } from './ChartHelpers';
import { ResourceType } from '../../enums';
import { Text } from 'react-native-elements';
import { ConfigFactory } from '../../config/ConfigFactory';
import { TranslationFile } from 'ow_translations';
import HeadingSubtitleText from './HeadingSubtitleText';
import LegendEntry from './LegendEntry';

export enum ChartDateOption {
  NoDate = 'NoDate', //Doesn't display any dates
  FirstAndLast = 'FirstAndLast', //displays only first and last dates
  Optimal = 'Optimal', //displays first and last dates, as well as any in between.
}

export enum ChartOverlayOption {
  None = 'None', //Doesn't overlay multiple graphs
  OneYear = 'OneYear', //Splits the readings into conscutive years and overlays
}

export type ChartOptions = {
  hasDots: boolean,
  //Just an idea: a function to split the intial data into an arra of arrays for overlaying
  overlays: ChartOverlayOption,
  dateOption: ChartDateOption,
  hasVerticalGrid: boolean,
  strictDateMode: boolean,
  shouldShowLegend: boolean,
  shouldShowTotal: boolean, //currently used for 3-month groundwater only
}

export interface SpecificChartProps {
  readings: AnyOrPendingReading[], 
  chunkedReadings: Array<Array<AnyOrPendingReading>>,
  resourceType: ResourceType, 
  timeseriesRange: TimeseriesRange,
  strictDateMode: boolean,
  translation: TranslationFile,
  unitOfMeasure: string,
}

//Given the input params, set up the chart options and return a configured chart
export const SpecificChart = (props: SpecificChartProps): JSX.Element => {
  const {
    readings,
    chunkedReadings,
    resourceType,
    timeseriesRange,
    translation,
    unitOfMeasure,
  } = props;

  //For now, ignore the resourceType

  //Split the readings to overlay them
  //Default to THREE_MONTHS
  let hasDots = true;
  let dateOption = ChartDateOption.Optimal;
  let overlays = ChartOverlayOption.None
  let hasVerticalGrid = true;
  let shouldShowLegend = false;
  let shouldShowTotal = false;

  if (timeseriesRange !== TimeseriesRange.THREE_MONTHS) {
    hasDots = false;
  }

  if (timeseriesRange === TimeseriesRange.THREE_MONTHS && resourceType === ResourceType.raingauge) {
    shouldShowTotal = true;
  }

  if (timeseriesRange === TimeseriesRange.THREE_YEARS) {
    overlays = ChartOverlayOption.OneYear;
    dateOption = ChartDateOption.NoDate;
    hasVerticalGrid = false;
    shouldShowLegend = true;
  }

  const options: ChartOptions = {
    hasDots,
    overlays,
    dateOption,
    hasVerticalGrid,
    strictDateMode: props.strictDateMode,
    shouldShowLegend,
    shouldShowTotal,
  };

  return (
    <SimpleChart
      readings={readings}
      chunkedReadings={chunkedReadings}
      pendingReadings={[]}
      timeseriesRange={timeseriesRange}
      options={options}
      translation={translation}
      unitOfMeasure={unitOfMeasure}
    />
  );
}

export type Props = {
  readings: AnyOrPendingReading[],
  chunkedReadings: Array<Array<AnyOrPendingReading>>,
  pendingReadings: PendingReading[],
  timeseriesRange: TimeseriesRange,
  options: ChartOptions,
  translation: TranslationFile,
  unitOfMeasure: string,
}


class SimpleChart extends React.PureComponent<Props> {

  getTotalSummary() {
    const { readings, options: { shouldShowTotal } } = this.props;
    if (!shouldShowTotal) {
      return null;
    }

    const {
      rainfall_total_heading,
      rainfall_total_subtitle,
      rainfall_total_content_subtitle,
    } = this.props.translation.templates;

    const total = readings.reduce((acc, curr) => acc + curr.value, 0);

    return (
      <View style={{
        flex: 1,
        flexDirection: "row",
        justifyContent: 'space-between',
        height: '100%',
        paddingHorizontal: 20,
        paddingTop: 5,
      }}>
        <HeadingSubtitleText 
          heading={rainfall_total_heading} 
          subtitle={rainfall_total_subtitle}
          content={`${total.toFixed(2)}`} 
          content_subtitle={rainfall_total_content_subtitle}
        />
      </View>
    );
  }


  getLegend() {
    const { options: { shouldShowLegend } } = this.props;
    if (!shouldShowLegend) {
      return null;
    }
    
    const {
      legend_text_year_one,
      legend_text_year_two,
      legend_text_year_three,
    } = this.props.translation.templates;
    
    const legendBoxDefaultStyle = { height: 20, width: 20 };
    const textDefaultStyle: StyleProp<TextStyle> = { fontWeight: '500' };

    return (
      <View style={{
        flex: 1,
        flexDirection: "row",
        justifyContent: 'space-between',
        maxHeight: 30,
        paddingHorizontal: 20,
        paddingTop: 5,
        paddingBottom: 5,
      }}>
        <LegendEntry
          title={legend_text_year_one}
          color={strokeForIndex(0)}
          opacity={strokeOpacityForIndex(0, 3)}
        />
        <LegendEntry
          title={legend_text_year_two}
          color={strokeForIndex(1)}
          opacity={strokeOpacityForIndex(1, 3)}
        />
        <LegendEntry
          title={legend_text_year_three}
          color={strokeForIndex(2)}
          opacity={strokeOpacityForIndex(2, 3)}
        />
      </View>
    )
  }

  render() {
    const { 
      readings, 
      chunkedReadings, 
      timeseriesRange, 
      unitOfMeasure,
      options: { 
        hasDots, 
        overlays, 
        dateOption, 
        hasVerticalGrid, 
        strictDateMode,
      } 
    } = this.props;

    const contentInset: ContentInsetType = { top: 5, bottom: 20, left: 20, right: 20 };
    const yAxisWidth = 40;
    const dates = getDatesForDataAndDistribution(readings, dateOption, timeseriesRange, strictDateMode);
    const { min, max } = getMinAndMaxValues(readings);

    return (
      <View style={{
        height: '100%',
        flexDirection: 'column',
      }}>
        <View style={{
          flexDirection: 'row',
          flex: 5,
          marginLeft: 15,
        }}>
          <SimpleYAxis
            data={readings}
            width={yAxisWidth}
            contentInset={contentInset}
          />
          {/* Main Readings - hidden when chunked readings are shown*/}
          <LineChart
            style={StyleSheet.absoluteFill}
            data={readings}
            yAccessor={({ item }: { item: AnyOrPendingReading }) => item.value }
            xAccessor={({ item }: { item: AnyOrPendingReading }) => moment(item.date).toDate()}
            svg={{
              //Ref: https://github.com/react-native-community/react-native-svg#common-props
              stroke: strokeForIndex(0),
              //Hide this one if we are using the map overlay, fixes scale problems
              strokeOpacity: overlays === ChartOverlayOption.None ? 1 : 0,
              strokeWidth: 3,
            }}
            contentInset={contentInset}
            xScale={scale.scaleTime}
            xMin={dates[0]}
            xMax={dates[dates.length - 1]}
            yMin={min}
            yMax={max}
          >
            {hasDots && <ChartDots/>}
            {!hasVerticalGrid && 
              <DateTicks 
                belowChart={true} 
                dateOption={dateOption}
                timeseriesRange={timeseriesRange}
                strictMode={strictDateMode}
              />}
            {hasVerticalGrid && 
              <VerticalGrid 
                dateOption={dateOption}
                timeseriesRange={timeseriesRange}
                strictMode={strictDateMode}
              />}
            <YAxisLabels 
              unitOfMeasure={unitOfMeasure}
            />
            <HorizontalGrid />
            <DateLabels 
              dateOption={dateOption}
              timeseriesRange={timeseriesRange}
              strictMode={strictDateMode}
            />
          </LineChart>
          {
            //The other line charts:
            chunkedReadings.map((readings, idx) => {
              //Skip the first one, it was rendered above
              if (overlays !== ChartOverlayOption.OneYear) {
                return null;
              }

              return (
                <LineChart
                  key={`line_chart_${idx}`}
                  style={StyleSheet.absoluteFill}
                  data={readings}
                  yAccessor={({ item }: { item: AnyOrPendingReading }) => item.value}
                  xAccessor={({ item }: { item: AnyOrPendingReading }) => moment(item.date).toDate()}
                  svg={{
                    //Ref: https://github.com/react-native-community/react-native-svg#common-props
                    stroke: strokeForIndex(idx),
                    strokeOpacity: strokeOpacityForIndex(idx, chunkedReadings.length),
                    strokeWidth: 3
                  }}
                  contentInset={contentInset}
                  xScale={scale.scaleTime}
                  xMin={dates[0]}
                  xMax={dates[dates.length - 1]}
                />
              );
            })
          }
        </View>
        {this.getTotalSummary()}
        {this.getLegend()}
      </View>
    )
  }
}

export default SimpleChart;