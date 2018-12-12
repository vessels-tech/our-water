import * as React from 'react'; import { Component } from 'react';
import {
  Avatar,
  Button,
  Card,
  Text,
} from 'react-native-elements';
import { OWTimeseries, Reading, TimeseriesRange, TimeseriesRangeReadings, TimeseriesReadings } from '../../typings/models/OurWater';
import { View } from 'react-native';
import { primaryLight, primaryDark, bgLight, bgLightHighlight } from '../../utils/Colors';
import LineChartExample from './DemoChart';
import { SomeResult } from '../../typings/AppProviderTypes';
import Loading from './Loading';
import { ConfigFactory } from '../../config/ConfigFactory';
import BaseApi from '../../api/BaseApi';

import { AppState, AnyOrPendingReading } from '../../reducers';
import * as appActions from '../../actions/index';
import { connect } from 'react-redux'
import { getTimeseriesReadingKey } from '../../utils';
import SimpleChart from './SimpleChart';
import { isNullOrUndefined, isNull } from 'util';
import { AnyTimeseries } from '../../typings/models/Timeseries';
import { PendingReading } from '../../typings/models/PendingReading';
import { OrgType } from '../../typings/models/OrgType';
import { AnyReading } from '../../typings/models/Reading';
import { ConfigTimeseries } from '../../typings/models/ConfigTimeseries';
import { ActionMeta } from '../../typings/Reducer';

export interface OwnProps {
  config: ConfigFactory,
  timeseries: ConfigTimeseries,
  resourceId: string,
  timeseriesId: string, 
  isPending: boolean,
}

export interface StateProps {
  tsReadings: AnyOrPendingReading[],
  newTsReadingsMeta: ActionMeta,
  timeseries_card_not_enough: string,
}

export interface ActionProps {
 
}

export interface State {
  currentRange: TimeseriesRange,
}

/**
 *  TimeseriesCard is a card that displays a timeseries graph,
 *  along with some basic controls for changing the time scale
 */
class TimeseriesCardSimple extends Component<OwnProps & StateProps & ActionProps> {
  appApi: BaseApi;
  state: State = {
    currentRange: TimeseriesRange.EXTENT,
  }

  constructor(props: OwnProps & StateProps & ActionProps) {
    super(props);

    //@ts-ignore
    this.appApi = this.props.config.getAppApi();
  }

  getNotEnoughReadingsDialog() {
    const { timeseries_card_not_enough } = this.props;
    return (
      <View style={{
        flex: 10,
        justifyContent: 'center',
      }}>
        <Text style={{ textAlign: 'center' }}>{timeseries_card_not_enough}</Text>
      </View>
    );
  }

  getGraphView() {
    const { currentRange } = this.state;
    const { tsReadings, newTsReadingsMeta, timeseries: { name }, resourceId } = this.props;

    if (newTsReadingsMeta.loading) {
      return <Loading/>
    }

    if (tsReadings.length === 0) {
      return this.getNotEnoughReadingsDialog();
    }

    // let chartReadings: AnyReading[] = [];
    // if (readings && readings.readings) {
    //   chartReadings = readings.readings;
    // }

    return (
      <View style={{
        flex: 5,
        justifyContent: 'center'
      }}>
        <SimpleChart
          pendingReadings={[]}
          readings={tsReadings}
          timeseriesRange={currentRange} 
        />
      </View>
    );
  }

  getBottomButtons() {
    return null;

    // const buttons: { text: string, value: TimeseriesRange }[] = [
    //   { text: '1Y', value: TimeseriesRange.ONE_YEAR},
    //   { text: '3M', value: TimeseriesRange.THREE_MONTHS},
    //   { text: '2W', value: TimeseriesRange.TWO_WEEKS},
    //   { text: 'EXTENT', value: TimeseriesRange.EXTENT},
    // ];

    // let timeseriesId = this.props.timeseries.parameter;
    // if (this.props.timeseries.type !== OrgType.NONE) {
    //   timeseriesId = this.props.timeseries.id;
    // }

    // return (
    //   <View style={{
    //       borderColor: bgLightHighlight,
    //       borderTopWidth: 2,
    //       paddingTop: 3,
    //       marginBottom: 5,
    //       height: 35,
    //     }}>
    //     <View style={{
    //       flexDirection: 'row-reverse',
    //     }}>
    //       {buttons.map(b => (
    //         <Button
    //           key={b.text}
    //           color={this.state.currentRange === b.value ? primaryLight : primaryDark}
    //           buttonStyle={{
    //             backgroundColor: this.state.currentRange === b.value ? primaryDark : bgLight,
    //             paddingHorizontal: 5,
    //             height: 30,
    //           }}
    //           title={b.text}
    //           onPress={() => {
    //             if (b.value === this.state.currentRange) {
    //               return;
    //             }

    //             this.setState({ currentRange: b.value });
    //             this.props.getReadings(this.appApi, this.props.resourceId, this.props.timeseries.name, timeseriesId, b.value);
    //           }}
    //         />
    //       ))}
    //     </View>
    //   </View>
    // );
  }

  render() {
    const { timeseries: { name } } = this.props;

    return (
      <View 
        style={{
          flexDirection: 'column',
          height: '100%',
          width: '100%',
          backgroundColor: bgLight,
        }}
      >
        <Text 
          style={{
            paddingVertical: 5,
            textDecorationLine: 'underline',
            fontSize: 15,
            fontWeight: '600',
            alignSelf: 'center',
          }}>
          {name}
        </Text>
        {this.getGraphView()}
        {this.getBottomButtons()}
      </View>
    );
  }
}

const mapStateToProps = (state: AppState, ownProps: OwnProps): StateProps => {
  let tsReadings = state.newTsReadings[ownProps.resourceId] || [];
  let newTsReadingsMeta = state.newTsReadingsMeta[ownProps.resourceId];
  if (!newTsReadingsMeta) {
    newTsReadingsMeta = { loading: true, error: false, errorMessage: '' };
  }

  if (ownProps.isPending && newTsReadingsMeta.loading) {
    newTsReadingsMeta = { loading: false, error: false, errorMessage: '' };
  } 

  return {
    tsReadings: tsReadings.filter(r => r.timeseriesId === ownProps.timeseriesId),
    newTsReadingsMeta,
    timeseries_card_not_enough: state.translation.templates.timeseries_card_not_enough,
  }
}

const mapDispatchToProps = (dispatch: any): ActionProps => {
  return {

  }
}

export default connect(mapStateToProps, mapDispatchToProps)(TimeseriesCardSimple);