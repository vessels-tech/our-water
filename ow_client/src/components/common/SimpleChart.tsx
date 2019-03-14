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
import { ChartDots, ShortGridLabels, ShortGrid, SimpleYAxis, ContentInsetType, DateTicks, DateLabels } from './ChartHelpers';
import ResourceStationType from 'ow_common/lib/enums/ResourceStationType';
import { ResourceType } from '../../enums';

export enum ChartDateOption {
  NoDate = 'NoDate', //Doesn't display any dates
  FirstAndLast = 'FirstAndLast', //displays only first and last dates
  Optimal = 'Optimal', //displays first and last dates, as well as any in between.
}

export type ChartOptions = {
  hasDots: boolean,
  //Just an idea: a function to split the intial data into an arra of arrays for overlaying
  overlays: (initial: Array<AnyOrPendingReading>) => Array<Array<AnyOrPendingReading>>,
  dateOption: ChartDateOption
}

export interface SpecificChartProps {
  readings: AnyOrPendingReading[], 
  resourceType: ResourceType, 
  timeseriesRange: TimeseriesRange
}

//Given the input params, set up the chart options and return a configured chart
export const SpecificChart = (props: SpecificChartProps): JSX.Element => {
  const {
    readings,
    resourceType,
    timeseriesRange,
  } = props;


  //For now, ignore the resourceType

  //Split the readings to overlay them
  //Default to THREE_MONTHS
  let hasDots = true;
  let dateOption = ChartDateOption.Optimal;
  let overlays = (initial: AnyOrPendingReading[]) => [initial];

  if (timeseriesRange !== TimeseriesRange.THREE_MONTHS) {
    hasDots = false;
  }

  if (timeseriesRange === TimeseriesRange.THREE_YEARS) {
    //TODO: implement array splitting based on dates
    overlays = (initial: AnyOrPendingReading[]) => [initial];
    dateOption = ChartDateOption.NoDate; //Basant asked for no dates, but I think first and last is better.
  }

  const options: ChartOptions = {
    hasDots,
    overlays,
    dateOption,
  };

  return (
    <SimpleChart
      readings={readings}
      pendingReadings={[]}
      timeseriesRange={timeseriesRange}
      options={options}
    />
  );
}

export type Props = {
  readings: AnyOrPendingReading[],
  pendingReadings: PendingReading[],
  timeseriesRange: TimeseriesRange,
  options: ChartOptions,
}


class SimpleChart extends React.PureComponent<Props> {

  render() {
    const { readings, options: { hasDots, overlays, dateOption } } = this.props;    
    const contentInset: ContentInsetType = { top: 5, bottom: 20, left: 20, right: 20 };
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
            {hasDots && <ChartDots/>}
            <DateTicks dateOption={dateOption}/>
            <DateLabels dateOption={dateOption}/>
          </LineChart>
        </View>
      </View>
    )
  }
}

export default SimpleChart;