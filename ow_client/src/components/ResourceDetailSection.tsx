import * as React from 'react'; import { Component } from 'react';
import {
  View,
  ViewPagerAndroid,
} from 'react-native';
import { 
  Avatar,
  Button,
  Card, 
  Text,
} from 'react-native-elements';

import Loading from './common/Loading';
import StatCard from './common/StatCard';
import {
  getShortId, isFavourite, getTimeseriesReadingKey, temporarySubtitleForTimeseriesName,
} from '../utils';
import { primary, bgMed, primaryLight, bgLight, primaryText, bgLightHighlight, secondary, } from '../utils/Colors';
import { Reading, OWTimeseries, TimeseriesRange, TimeseriesReadings, TimeSeriesReading } from '../typings/models/OurWater';
import { ConfigFactory } from '../config/ConfigFactory';
import BaseApi from '../api/BaseApi';
import HeadingText from './common/HeadingText';
import HeadingSubtitleText from './common/HeadingSubtitleText';
import FlatIconButton from './common/FlatIconButton';
import TimeseriesCard from './common/TimeseriesCard';

import { AppState } from '../reducers';
import * as appActions from '../actions/index';
import { connect } from 'react-redux'
import { SyncMeta } from '../typings/Reducer';

import * as ScrollableTabView from 'react-native-scrollable-tab-view';
import { TranslationFile } from 'ow_translations/Types';
import { AnyReading } from '../typings/models/Reading';
import { AnyResource } from '../typings/models/Resource';
import { AnyTimeseries } from '../typings/models/Timeseries';
// import ScrollableTabView, { DefaultTabBar } from 'react-native-scrollable-tab-view';

// import * as ScrollableTabView from 'react-native-scrollable-tab-view';


export interface OwnProps {
  config: ConfigFactory,
  resource: AnyResource,
  userId: string,
  onAddReadingPressed: any,
  hideTopBar: boolean,
}

export interface StateProps {
  tsReadings: TimeseriesReadings,
  favouriteResourcesMeta: SyncMeta,
  favouriteResources: AnyResource[],
  translation: TranslationFile,
}

export interface ActionProps {
  action_addFavourite: any,
  action_removeFavourite: any,
  getReadings: (api: BaseApi, resourceId: string, timeseriesId: string, range: TimeseriesRange) => any,
}

export interface State {

}

class ResourceDetailSection extends Component<OwnProps & StateProps & ActionProps> {
  appApi: BaseApi;
  state: State = {}

  constructor(props: OwnProps & StateProps & ActionProps) {
    super(props);

    this.appApi = this.props.config.getAppApi();

    const DEFAULT_RANGE = TimeseriesRange.EXTENT;
    const { resource: { id, timeseries } } = this.props;
    timeseries.forEach((ts: any) => this.props.getReadings(this.appApi, id, ts.id, DEFAULT_RANGE));
  }


  getHeadingBar() {
    const { resource: { id }} = this.props;
    const showSubtitle = this.props.config.getResourceDetailShouldShowSubtitle();

    return (
      <View style={{
        flex: 1,
        flexDirection: 'row',
        backgroundColor: primaryLight,
      }}>
        <Avatar
          containerStyle={{
            marginLeft: 15,
            backgroundColor: primary,
            alignSelf: 'center',
          }}
          rounded
          title="GW"
          activeOpacity={0.7}
        />
        <View style={{
          paddingLeft: 15,
          alignSelf: 'center',
        }}>
          <Text style={{ color: primaryText, fontSize: 17, fontWeight: '500' }}>{`Id: ${getShortId(id)}`}</Text>
          { showSubtitle ? 
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}>
              {/* TODO: input translation: resource_detail_name_label */}
              <Text style={{ color: primaryText, fontSize: 17, fontWeight: '100' }}>Name: {name}</Text>
              {/* TODO: enable code? Most of the time it's the same as Name. */}
              {/* <Text style={{ color: textLight, fontSize: 17, fontWeight: '100', paddingLeft: 20 }}>Code: {name}</Text> */}
            </View>
            : null }
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

    resource.timeseries.forEach((ts: any) => {
      const key = getTimeseriesReadingKey(ts.id, TimeseriesRange.EXTENT);
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
        const readings = readingsMap.get(key);
        let content = 'N/A';
        if (readings) {
          const latestReading = readings[readings.length - 1];
          if (latestReading) {
            content = `${latestReading.value}`;
          }
        }
        const timeseries = resource.timeseries[idx];
        return (
          <HeadingSubtitleText 
            key={key} 
            heading={timeseries.name} 
            subtitle={temporarySubtitleForTimeseriesName(timeseries.name)}
            content={content} 
          />
        )
      })
    );
  }

  getSummaryCard() {
    const { translation: { templates: { resource_detail_latest }}} = this.props;

    return (
        <View style={{
          flexDirection: 'column',
          height: '100%',
          padding: 20,
        }}>
          <View style={{
            flexDirection: 'column',
            flex: 2,
          }}>
            {/* <HeadingText heading={'Station Type:'} content={'TODO'}/> */}
            {/* <HeadingText heading={'Status'} content={'TODO'}/> */}
            <Text style={{
              paddingVertical: 10,
              fontSize: 15,
              fontWeight: '600',
              alignSelf: 'center',
            }}>
              {resource_detail_latest}
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
            borderColor: bgLightHighlight,
            borderTopWidth: 1,
            flexDirection: 'row-reverse',
          }}>
            {this.getFavouriteButton()}
            {this.getReadingButton()}
          </View>
        </View>
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
    const { resource, translation: { templates: { resource_detail_summary_tab }} } = this.props;

    return (
      <View style={{
        flex: 15,
        backgroundColor: bgMed,
      }}>
        <ScrollableTabView 
          style={{ paddingTop: 0}}
          containerStyle={{}}
          tabStyle={{
            height: 20,
          }}
          renderTabBar={() => (
            <ScrollableTabView.DefaultTabBar
              tabStyle={{
                backgroundColor: primaryLight,
              }}
              textStyle={{
                color: primaryText,
              }}
            />
          )}>
          <View 
            key="1" 
            style={{
              backgroundColor: bgLight,
            }}
            // @ts-ignore
            tabLabel={resource_detail_summary_tab}
            >
            {this.getSummaryCard()}
          </View>
            {
              resource.timeseries.map((ts: AnyTimeseries, idx: number) => {
                return (
                  // @ts-ignore
                  <View tabLabel={`${ts.name}`} key={idx} style={{ alignItems: 'center' }}>
                    <TimeseriesCard
                      config={this.props.config}
                      resourceId={this.props.resource.id}
                      timeseries={ts}
                    />
                  </View>
                );
              })
            }
        </ScrollableTabView>
      </View>
    );
  }

  getReadingButton() {
    return (
      <Button
        color={secondary}
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
        color={secondary}
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
        flex: 5,
      }}>
        {this.props.hideTopBar ? null : this.getHeadingBar()}
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
    translation: state.translation,
  }
}

const mapDispatchToProps = (dispatch: any): ActionProps => {
  return {
    action_addFavourite: (api: BaseApi, userId: string, resource: AnyResource) => 
      dispatch(appActions.addFavourite(api, userId, resource)),
    action_removeFavourite: (api: BaseApi, userId: string, resourceId: string) =>
      dispatch(appActions.removeFavourite(api, userId, resourceId)),
    getReadings: (api: BaseApi, resourceId: string, timeseriesId: string, range: TimeseriesRange) => 
      dispatch(appActions.getReadings(api, resourceId, timeseriesId, range)),

  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ResourceDetailSection);