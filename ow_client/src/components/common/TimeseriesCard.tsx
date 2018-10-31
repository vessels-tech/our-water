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

export interface OwnProps {
  config: ConfigFactory,
  timeseries: OWTimeseries,
  resourceId: string,
}

export interface StateProps {
  tsReadings: TimeseriesReadings,
}

export interface ActionProps {
  getReadings: (api: BaseApi, resourceId: string, timeseriesId: string, range: TimeseriesRange) => any,
}

export interface State {
  currentRange: TimeseriesRange,
}

/**
 *  TimeseriesCard is a card that displays a timeseries graph,
 *  along with some basic controls for changing the time scale
 */
class TimeseriesCard extends Component<OwnProps & StateProps & ActionProps> {
  appApi: BaseApi;
  state: State = {
    currentRange: TimeseriesRange.EXTENT,
  }

  constructor(props: OwnProps & StateProps & ActionProps) {
    super(props);

    //@ts-ignore
    this.appApi = this.props.config.getAppApi();
  }

  getGraphView() {
    const { currentRange } = this.state;
    const { tsReadings, timeseries: {id}, resourceId } = this.props;

    const readings = tsReadings[getTimeseriesReadingKey(id, currentRange)];
    if (isNullOrUndefined(readings) || isNullOrUndefined(readings.readings) || readings.readings && readings.readings.length === 0) {
      return (
        <View style={{
          flex: 10,
          justifyContent: 'center',
        }}>
          <Text style={{textAlign: 'center'}}>Not enough readings for this time range.</Text>
        </View>
      )
    }

    if (readings.meta.loading) {
      return (
        <View style={{
          flex: 5,
          justifyContent: 'center',
        }}>
          <Loading/>
        </View>
      );
    }

    return (
      <View style={{
        flex: 5,
        justifyContent: 'center'
      }}>
        <SimpleChart
          readings={readings.readings}
          timeseriesRange={currentRange} 
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
                this.props.getReadings(this.appApi, this.props.resourceId, this.props.timeseries.id, b.value);
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
      // <Card
      //   containerStyle={{
      //     width: '90%',
      //     height: '90%',
      //     padding: 0,
      //   }}
      //   >
        <View style={{
          flexDirection: 'column',
          height: '100%',
          width: '100%',
          backgroundColor: bgLight,
        }}>
          <Text style={{
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
      // </Card>
    )
  }
}

const mapStateToProps = (state: AppState, ownProps: OwnProps): StateProps => {

  return {
    tsReadings: state.tsReadings,
  }
}

const mapDispatchToProps = (dispatch: any): ActionProps => {
  return {
    getReadings: (api: BaseApi, resourceId: string, timeseriesId: string, range: TimeseriesRange) =>
      dispatch(appActions.getReadings(api, resourceId, timeseriesId, range)),

  }
}

export default connect(mapStateToProps, mapDispatchToProps)(TimeseriesCard);