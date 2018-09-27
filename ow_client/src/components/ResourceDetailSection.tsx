import * as React from 'react'; import { Component } from 'react';
import {
  View,
  ViewPagerAndroid,
  TouchableNativeFeedback
} from 'react-native';
import { 
  Avatar,
  Button,
  Card, 
  Text,
} from 'react-native-elements';

import Loading from './common/Loading';
import IconButton from './common/IconButton';
import StatCard from './common/StatCard';
import {
  getShortId, isFavourite, getTimeseriesReadingKey,
} from '../utils';
import FirebaseApi from '../api/FirebaseApi';
import Config from 'react-native-config';
import { primary, textDark, bgMed, primaryDark, bgDark, primaryLight, bgDark2, textLight, bgLight, textMed } from '../utils/Colors';
import { Resource, Reading, OWTimeseries, TimeseriesRange, TimeseriesReadings, TimeSeriesReading, TimeseriesRangeReadings } from '../typings/models/OurWater';
import { ConfigFactory } from '../config/ConfigFactory';
import BaseApi from '../api/BaseApi';
import { GGMNTimeseries } from '../typings/models/GGMN';
import * as moment from 'moment';
import HeadingText from './common/HeadingText';
import { S_IFIFO } from 'constants';
import FlatIconButton from './common/FlatIconButton';
import TimeseriesCard from './common/TimeseriesCard';

import { AppState } from '../reducers';
import * as appActions from '../actions/index';
import { connect } from 'react-redux'
import { SyncMeta } from '../typings/Reducer';
import { Action } from 'redux';


export interface OwnProps {
  config: ConfigFactory,
  resource: Resource,
  userId: string,
  onAddReadingPressed: any,
  onMorePressed: any,
  onAddToFavourites: any,
  onRemoveFromFavourites: any,
}

export interface StateProps {
  tsReadings: TimeseriesReadings,
  favouriteResourcesMeta: SyncMeta,
  favouriteResources: Resource[],
}

export interface ActionProps {
  action_addFavourite: any,
  action_removeFavourite: any,
  getReadings: (api: BaseApi, resourceId: string, timeseriesId: string, range: TimeseriesRange) => any,
}

export interface State {

}

class ResourceDetailSection extends Component<OwnProps & StateProps & ActionProps> {
  unsubscribe: any;
  appApi: BaseApi;
  state: State = {}

  constructor(props: OwnProps & StateProps & ActionProps) {
    super(props);

    //@ts-ignore
    this.appApi = this.props.config.getAppApi();

    const DEFAULT_RANGE = TimeseriesRange.TWO_WEEKS;
    const { resource: { id, timeseries } } = this.props;
    timeseries.forEach(ts => this.props.getReadings(this.appApi, id, ts.id, DEFAULT_RANGE));
  }

  componentDidMount() {
  
  
  }

  getHeadingBar() {
    const { resource: { id, owner: { name } } } = this.props;

    return (
      <View style={{
        flex: 1,
        flexDirection: 'row',
        backgroundColor: primaryDark,
      }}>
        <Avatar
          containerStyle={{
            marginLeft: 15,
            backgroundColor: primaryLight,
            alignSelf: 'center',
          }}
          rounded
          // size="large"
          title="GW"
          activeOpacity={0.7}
        />
        <View style={{
          paddingLeft: 15,
          alignSelf: 'center',
        }}>
          <Text style={{ color:textLight, fontSize: 17, fontWeight: '500' }}>{`Id: ${getShortId(id)}`}</Text>
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}>
            <Text style={{ color: textLight, fontSize: 17, fontWeight: '100' }}>Name: {name}</Text>
            {/* TODO: enable code? Most of the time it's the same as Name. */}
            {/* <Text style={{ color: textLight, fontSize: 17, fontWeight: '100', paddingLeft: 20 }}>Code: {name}</Text> */}
          </View>
        </View>
      </View>
    )
  }

  statCardForTimeseries(key: string, ts: Reading[]|undefined) {
    if (!ts) {
      return null;
    }

    let value = 0;
    if (ts[0]) {
      //For now, assume the last object is the newest
      value = ts[0].value;
    }
    return (
      <StatCard
        key={key}
        title={`${key}`}
        value={`${value}`}
      />
    );
  }

  getLatestReadingsForTimeseries() {
    const { tsReadings, resource } = this.props;

    let loading = false;
    const readingsMap = new Map<string, Reading[]>();

    resource.timeseries.forEach(ts => {
      const key = getTimeseriesReadingKey(ts.id, TimeseriesRange.TWO_WEEKS);
      const tsReading: TimeSeriesReading | undefined = tsReadings[key]
      if (!tsReading) {
        return <Loading />
      }

      //Let's say two weeks is the default, and should always be either there or pending
      if (tsReading.meta.loading) {
        loading = true;
      }

      readingsMap.set(ts.id, tsReading.readings);
    });

    if (loading) {
      return <Loading/>
    }

    const keys = [...readingsMap.keys()];
    return (
      keys.map((key, idx) => {
        const value = readingsMap.get(key);
        const timeseries = resource.timeseries[idx];
        return (
          <HeadingText key={key} heading={timeseries.name} content={`${value}`} />
        )
      })
    );
  }

  getSummaryCard() {
    return (
      <Card
        containerStyle={{
          width: '90%',
          height: '90%',
        }}
      >
        <View style={{
          flexDirection: 'column',
          height: '100%',
        }}>
          <View style={{
            flexDirection: 'column',
            flex: 2,
          }}>
            <HeadingText heading={'Station Type:'} content={'TODO'}/>
            <HeadingText heading={'Status'} content={'TODO'}/>
            <Text style={{
              paddingVertical: 10,
              textDecorationLine: 'underline',
              fontSize: 15,
              fontWeight: '600',
              alignSelf: 'center',
            }}>
              Latest Readings:
            </Text>
          </View>

          <View style={{
            flexDirection: 'column',
            flex: 5,
            justifyContent: 'center',
          }}>
            {this.getLatestReadingsForTimeseries()}
          </View>

          {/* Bottom Buttons */}
          <View style={{
            flex: 1,
            maxHeight: 30,
            borderColor: textLight,
            borderTopWidth: 2,
            flexDirection: 'row-reverse',
          }}>
            {this.getFavouriteButton()}
            {this.getReadingButton()}
          </View>
        </View>
      </Card>
    );
  }

  getCardForTimeseries(ts: OWTimeseries) {
    return (
      <Card
        containerStyle={{
          width: '90%',
          height: '90%',
          alignItems: 'center',
        }}
        title={ts.name}>
      </Card>
    )
  }

  getReadingsView() {
    const { tsReadings, resource } = this.props;

    return (
      <View style={{
        flex: 15,
      }}>
        <ViewPagerAndroid
          //@ts-ignore
          style={{
            height: '100%',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          initialPage={0}
        >
          <View key="1" style={{
              alignItems: 'center',
            }}>
            {this.getSummaryCard()}
          </View>
          {
            resource.timeseries.map((ts: OWTimeseries, idx: number) => {
              return (
                <View key={idx} style={{alignItems: 'center'}}>
                  {/* TODO: how to fix this? the other properties are being set by redux */}
                  <TimeseriesCard 
                    config={this.props.config}
                    resourceId={this.props.resource.id}
                    timeseries={ts}
                  />
                </View>
              );
            })
          }
        </ViewPagerAndroid>
      </View>
    );
  }

  getReadingButton() {
    return (
      <Button
        color={primaryDark}
        buttonStyle={{
          backgroundColor: bgLight,
          borderRadius: 5,
          flex: 1,
          marginTop: 6,
        }}
        title='NEW READING'
        onPress={() => this.props.onAddReadingPressed(this.props.resource)}
      />
    );
  }

  getFavouriteButton() {
    const { favouriteResourcesMeta } = this.props;
    const favourite = isFavourite(
      this.props.favouriteResources,
      this.props.resource.id
    );

    let iconName = 'star-half';
    if (favourite) {
      iconName = 'star';
    }

    return (
      <FlatIconButton
        // use star-outlined when not a fav
        name={iconName}
        onPress={() => this.toggleFavourites()}
        color={primaryDark}
        isLoading={favouriteResourcesMeta.loading}
      />
    );
  }

  async toggleFavourites() {
    const favourite = isFavourite(
      this.props.favouriteResources,
      this.props.resource.id
    );
  
    this.setState({ isFavourite: !favourite});

    if (!favourite) {
      return await this.props.action_addFavourite(this.appApi, this.props.userId, this.props.resource)
    }

    return await this.props.action_removeFavourite(this.appApi, this.props.userId, this.props.resource.id);
  }

  render() {        
    return (
      <View style={{
        flexDirection: 'column',
        flex: 1,
      }}>
        {this.getHeadingBar()}
        {this.getReadingsView()}
      </View>
    );
  }
};

const mapStateToProps = (state: AppState, ownProps: OwnProps): StateProps =>  {

  return {
    favouriteResourcesMeta: state.favouriteResourcesMeta,
    favouriteResources: state.favouriteResources,
    tsReadings: state.tsReadings,
  }
}

const mapDispatchToProps = (dispatch: any): ActionProps => {
  return {
    action_addFavourite: (api: BaseApi, userId: string, resource: Resource) => 
      dispatch(appActions.addFavourite(api, userId, resource)),
    action_removeFavourite: (api: BaseApi, userId: string, resourceId: string) =>
      dispatch(appActions.removeFavourite(api, userId, resourceId)),
    getReadings: (api: BaseApi, resourceId: string, timeseriesId: string, range: TimeseriesRange) => 
      dispatch(appActions.getReadings(api, resourceId, timeseriesId, range)),

  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ResourceDetailSection);