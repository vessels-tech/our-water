import * as React from 'react'; import { Component } from 'react';
import {
  Avatar,
  Button,
  Card,
  Text,
  Divider,
} from 'react-native-elements';
import { OWTimeseries, Reading, TimeseriesRange, TimeseriesRangeReadings, TimeseriesReadings } from '../../typings/models/OurWater';
import { View, FlatList } from 'react-native';
import { primaryLight, primaryDark, bgLight, bgLightHighlight } from '../../utils/Colors';
import LineChartExample from './DemoChart';
import { SomeResult } from '../../typings/AppProviderTypes';
import Loading from './Loading';
import { ConfigFactory } from '../../config/ConfigFactory';
import BaseApi from '../../api/BaseApi';

import { AppState, AnyOrPendingReading } from '../../reducers';
import * as appActions from '../../actions/index';
import { connect } from 'react-redux'
import { getTimeseriesReadingKey, filterAndSort } from '../../utils';
import SimpleChart from './SimpleChart';
import { isNullOrUndefined, isNull } from 'util';
import { AnyTimeseries } from '../../typings/models/Timeseries';
import { PendingReading } from '../../typings/models/PendingReading';
import { OrgType } from '../../typings/models/OrgType';
import { AnyReading } from '../../typings/models/Reading';
import { ConfigTimeseries } from '../../typings/models/ConfigTimeseries';
import { ActionMeta } from '../../typings/Reducer';
import { surfaceLight } from '../../assets/ggmn/NewColors';
import { surface, surfaceDark, surfaceText } from '../../utils/NewColors';
import moment = require('moment');
import { TranslationFile } from 'ow_translations';

export enum TimeseriesCardType {
  default = 'graph',
  graph = 'graph',
  table = 'table',
}

export interface OwnProps {
  config: ConfigFactory,
  timeseries: ConfigTimeseries,
  resourceId: string,
  timeseriesId: string, 
  isPending: boolean,
  cardType: TimeseriesCardType,
}

export interface StateProps {
  tsReadings: AnyOrPendingReading[],
  newTsReadingsMeta: ActionMeta,
  timeseries_card_not_enough: string,
  translation: TranslationFile,
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
    const { cardType, tsReadings, newTsReadingsMeta, timeseries: { name }, resourceId } = this.props;
    if (cardType !== TimeseriesCardType.graph) {
      return null;
    }

    if (newTsReadingsMeta.loading) {
      return <Loading/>
    }

    //Sort and filter the readings by the current range
    const filteredReadings = filterAndSort(tsReadings, currentRange);
    if (filteredReadings.length === 0) {
      return this.getNotEnoughReadingsDialog();
    }
    
    return (
      <View style={{
        flex: 5,
        justifyContent: 'center'
      }}>
        <SimpleChart
          pendingReadings={[]}
          readings={filteredReadings}
          timeseriesRange={currentRange} 
        />
      </View>
    );
  }

  getTableView() {
    const { currentRange } = this.state;
    const { cardType, tsReadings, newTsReadingsMeta, timeseries: { unitOfMeasure } } = this.props;
    // const { default_datetime_format } = this.props.translation.templates;
    //TODO: Translate!
    const default_datetime_format = "HH:MM DD/MM/YY";
    if (cardType !== TimeseriesCardType.table) {
      return null;
    }

    if (newTsReadingsMeta.loading) {
      return <Loading />
    }

    //Sort and filter the readings by the current range
    const filteredReadings = filterAndSort(tsReadings, currentRange);
    if (filteredReadings.length === 0) {
      return this.getNotEnoughReadingsDialog();
    }
    //Reverse the array so that the recent readings appear on top
    const reversed = filteredReadings.reverse();

    return (
      <View style={{
        flex: 5,
        justifyContent: 'center'
      }}>
        <FlatList
          data={reversed}
          keyExtractor={(item: AnyOrPendingReading) => `${item.date}+${item.value}`}
          renderItem={({item, index}: {item: AnyOrPendingReading, index: number}) => {
            return (
              <View
                style={{
                  flex: 1,
                  flexDirection: 'row', 
                  paddingHorizontal: 10,
                  paddingVertical: 10,
                  justifyContent: 'space-around',
                  backgroundColor: index % 2 === 0 ? surface : surfaceDark,
                }}
              >
                <Text
                  style={{ flex: 4 }}
                >{moment(item.date).format(default_datetime_format)}</Text>
                <Text
                  style={{ flex: 1}}
                >{`${item.value} ${unitOfMeasure}`}</Text>
              </View> 
            )
          }}
        />
      </View>
    );
  }

  getBottomButtons() {
    const buttons: { text: string, value: TimeseriesRange }[] = [
      { text: '1Y', value: TimeseriesRange.ONE_YEAR},
      { text: '3M', value: TimeseriesRange.THREE_MONTHS},
      { text: '2W', value: TimeseriesRange.TWO_WEEKS},
      { text: 'EXTENT', value: TimeseriesRange.EXTENT},
    ];

    return (
      <View style={{
          borderColor: bgLightHighlight,
          borderTopWidth: 2,
          paddingTop: 3,
          marginBottom: 5,
          height: 35,
        }}>
        <View style={{
          flexDirection: 'row-reverse',
        }}>
          {buttons.map(b => (
            <Button
              key={b.text}
              color={this.state.currentRange === b.value ? primaryLight : primaryDark}
              buttonStyle={{
                backgroundColor: this.state.currentRange === b.value ? primaryDark : bgLight,
                paddingHorizontal: 5,
                height: 30,
              }}
              title={b.text}
              onPress={() => {
                if (b.value === this.state.currentRange) {
                  return;
                }
                this.setState({ currentRange: b.value });
              }}
            />
          ))}
        </View>
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
        {this.getTableView()}
        {this.getBottomButtons()}
      </View>
    );
  }
}

const mapStateToProps = (state: AppState, ownProps: OwnProps): StateProps => {
  let tsReadings = state.newTsReadings[ownProps.resourceId] || [];
  let newTsReadingsMeta = state.newTsReadingsMeta[ownProps.resourceId];
  if (!newTsReadingsMeta) {
    //Not sure
    newTsReadingsMeta = { loading: false, error: false, errorMessage: '' };
  }

  if (ownProps.isPending && newTsReadingsMeta.loading) {
    newTsReadingsMeta = { loading: false, error: false, errorMessage: '' };
  } 

  return {
    tsReadings: tsReadings.filter(r => r.timeseriesId === ownProps.timeseriesId),
    newTsReadingsMeta,
    timeseries_card_not_enough: state.translation.templates.timeseries_card_not_enough,
    translation: state.translation,
  }
}

const mapDispatchToProps = (dispatch: any): ActionProps => {
  return {

  }
}

export default connect(mapStateToProps, mapDispatchToProps)(TimeseriesCardSimple);