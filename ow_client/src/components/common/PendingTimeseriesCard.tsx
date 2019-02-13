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

import { AppState } from '../../reducers';
import * as appActions from '../../actions/index';
import { connect } from 'react-redux'
import { getTimeseriesReadingKey } from '../../utils';
import SimpleChart from './SimpleChart';
import { isNullOrUndefined, isNull } from 'util';
import { AnyTimeseries } from '../../typings/models/Timeseries';
import { PendingReading } from '../../typings/models/PendingReading';
import { PendingTimeseries } from '../../typings/models/PendingTimeseries';
import { TranslationFile } from 'ow_translations';

export interface OwnProps {
  config: ConfigFactory,
  timeseries: PendingTimeseries,
  resourceId: string,
  pendingReadings: PendingReading[],
}

export interface StateProps {
  tsReadings: TimeseriesReadings,
  translation: TranslationFile,
}

export interface ActionProps {

}

export interface State {
  // currentRange: TimeseriesRange,
}

/**
 *  PendingTimeseriesCard is a stripped back version of timeseries card,
 *  with displays only PendingReadings, and doesn't perform any requests
 */
class PendingTimeseriesCard extends Component<OwnProps & StateProps & ActionProps> {
  // appApi: BaseApi;
  // state: State = {
  //   currentRange: TimeseriesRange.EXTENT,
  // }

  constructor(props: OwnProps & StateProps & ActionProps) {
    super(props);

    //@ts-ignore
    this.appApi = this.props.config.getAppApi();
  }

  getNotEnoughReadingsDialog() {
    const { timeseries_card_not_enough } = this.props.translation.templates;

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
    // const { currentRange } = this.state;
    const { pendingReadings, tsReadings, timeseries: { name }, resourceId } = this.props;

    // const readings = tsReadings[getTimeseriesReadingKey(resourceId, name, currentRange)];

    if (!pendingReadings) {
      return this.getNotEnoughReadingsDialog();
    }

    if (pendingReadings.length === 0) {
      return this.getNotEnoughReadingsDialog();
    }

    return (
      <View style={{
        flex: 5,
        justifyContent: 'center'
      }}>
        <SimpleChart
          pendingReadings={this.props.pendingReadings}
          readings={[]}
          timeseriesRange={TimeseriesRange.EXTENT}
        />
      </View>
    );
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
      </View>
    );
  }
}

const mapStateToProps = (state: AppState, ownProps: OwnProps): StateProps => {

  return {
    tsReadings: state.tsReadings,
    translation: state.translation,
  }
}

const mapDispatchToProps = (dispatch: any): ActionProps => {
  return {
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(PendingTimeseriesCard);