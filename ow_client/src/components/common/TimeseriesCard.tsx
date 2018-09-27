import * as React from 'react'; import { Component } from 'react';
import {
  Avatar,
  Button,
  Card,
  Text,
} from 'react-native-elements';
import { OWTimeseries, Reading, TimeseriesRange, TimeseriesRangeReadings, TimeseriesReadings } from '../../typings/models/OurWater';
import { View } from 'react-native';
import { textLight, primaryDark, bgLight } from '../../utils/Colors';
import LineChartExample from './DemoChart';
import { SomeResult } from '../../typings/AppProviderTypes';
import Loading from './Loading';
import { ConfigFactory } from '../../config/ConfigFactory';
import BaseApi from '../../api/BaseApi';

import { AppState } from '../../reducers';
import * as appActions from '../../actions/index';
import { connect } from 'react-redux'
import { getTimeseriesReadingKey } from '../../utils';

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
    currentRange: TimeseriesRange.TWO_WEEKS,
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
    if (!readings) {
      console.warn("No readings found for key", getTimeseriesReadingKey(id, currentRange));
      return null;
    }

    console.log("GetGraphView for range", readings);

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

    //TODO: actually load readings
    return (
      <View style={{
        // backgroundColor: 'red',
        flex: 5,
        justifyContent: 'center'
      }}>
        <LineChartExample/>
      </View>
    );
  }

  getBottomButtons() {
    const buttons: { text: string, value: TimeseriesRange}[] = [
      { text: '1Y', value: TimeseriesRange.ONE_YEAR},
      { text: '3M', value: TimeseriesRange.THREE_MONTHS},
      { text: '2W', value: TimeseriesRange.TWO_WEEKS},
      { text: 'EXTENT', value: TimeseriesRange.EXTENT},
    ];

    return (
      <View style={{
          flex: 1,
          borderColor: textLight,
          borderTopWidth: 2,
          maxHeight: 40,
        }}>
        <View style={{
          flexDirection: 'row-reverse',
        }}>
          {buttons.map(b => (
            <Button
              key={b.text}
              color={primaryDark}
              buttonStyle={{
                backgroundColor: bgLight,
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
    console.log("rendering TimeseriesCard");

    return (
      <Card
        containerStyle={{
          width: '90%',
          height: '90%',
          padding: 0,
        }}
        >
        <View style={{
          flexDirection: 'column',
          height: '100%',
        }}>
          <Text style={{
            flex: 1,
            paddingVertical: 10,
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
      </Card>
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