import * as React from 'react'

//@ts-ignore
import { LineChart, Grid, XAxis, YAxis } from 'react-native-svg-charts'
// import * as shape from 'd3-shape'
import { TimeseriesRange } from '../../typings/models/OurWater';
import { primary, primaryDark, secondary, primaryLight } from '../../utils/Colors';
import { View, StyleSheet } from 'react-native';
import * as moment from 'moment'
import { PendingReading } from '../../typings/models/PendingReading';
import { AnyOrPendingReading } from '../../reducers';
//@ts-ignore
import * as scale from 'd3-scale';
import Svg, { Circle, Line, Rect, Text } from 'react-native-svg'
import { arrayLowest } from '../../utils';
import { RemoteConfigDeveloperMode } from '../../utils/EnvConfig';
import { ChartDots, ShortGridLabels, ShortGrid, SimpleYAxis, ContentInsetType, DateTicks, DateLabels, VerticalGrid, getDatesForDataAndDistribution, YAxisLabels } from './ChartHelpers';
import ResourceStationType from 'ow_common/lib/enums/ResourceStationType';
import { ResourceType } from '../../enums';
import { secondaryDark, secondaryPallette, prettyColors } from '../../utils/NewColors';

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
}

export interface SpecificChartProps {
  readings: AnyOrPendingReading[], 
  chunkedReadings: Array<Array<AnyOrPendingReading>>,
  resourceType: ResourceType, 
  timeseriesRange: TimeseriesRange,
  strictDateMode: boolean,
}

//Given the input params, set up the chart options and return a configured chart
export const SpecificChart = (props: SpecificChartProps): JSX.Element => {
  const {
    readings,
    chunkedReadings,
    resourceType,
    timeseriesRange,
  } = props;


  //For now, ignore the resourceType

  //Split the readings to overlay them
  //Default to THREE_MONTHS
  let hasDots = true;
  let dateOption = ChartDateOption.Optimal;
  let overlays = ChartOverlayOption.None
  let hasVerticalGrid = true;

  if (timeseriesRange !== TimeseriesRange.THREE_MONTHS) {
    hasDots = false;
  }

  if (timeseriesRange === TimeseriesRange.THREE_YEARS) {
    overlays = ChartOverlayOption.OneYear;
    dateOption = ChartDateOption.NoDate;
    hasVerticalGrid = false;
  }

  const options: ChartOptions = {
    hasDots,
    overlays,
    dateOption,
    hasVerticalGrid,
    strictDateMode: props.strictDateMode,
  };

  return (
    <SimpleChart
      readings={readings}
      chunkedReadings={chunkedReadings}
      pendingReadings={[]}
      timeseriesRange={timeseriesRange}
      options={options}
    />
  );
}

export type Props = {
  readings: AnyOrPendingReading[],
  chunkedReadings: Array<Array<AnyOrPendingReading>>,
  pendingReadings: PendingReading[],
  timeseriesRange: TimeseriesRange,
  options: ChartOptions,
}


const strokeForIndex = (idx: number): string => {
  const colors = [
    secondaryDark,
    "#735D9B",
    "#77B79F",
  ];
  const remainder = idx % colors.length;
  return colors[remainder];
}

class SimpleChart extends React.PureComponent<Props> {


  
  render() {
    const { readings, chunkedReadings, timeseriesRange, options: { hasDots, overlays, dateOption, hasVerticalGrid, strictDateMode } } = this.props;    
    const contentInset: ContentInsetType = { top: 5, bottom: 20, left: 20, right: 20 };
    const yAxisWidth = 40;

    const dates = getDatesForDataAndDistribution(readings, dateOption, timeseriesRange, strictDateMode);


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
            // data={overlays === ChartOverlayOption.None ? readings : chunkedReadings[0]}
            // data={chunkedReadings[0]}
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
            // yScale={scale.scaleLinear}
            // TODO: make configurable with "strict setting"
            xMin={dates[0]}
            xMax={dates[dates.length - 1]}
            //Need these for custom horizonal grid to work
            yMin={0}
            yMax={30}
          >
            {/* <Grid/> */}
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
            <YAxisLabels />
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
                    strokeOpacity: 1,
                    strokeWidth: 3
                  }}
                  contentInset={contentInset}
                  xScale={scale.scaleTime}
                  // TODO: make configurable with "strict setting"
                  xMin={dates[0]}
                  xMax={dates[dates.length - 1]}
                />
              );
            })
          }
        </View>
      </View>
    )
  }
}

export default SimpleChart;