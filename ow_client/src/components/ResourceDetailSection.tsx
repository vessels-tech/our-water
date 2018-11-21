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
import * as moment from 'moment';

import Loading from './common/Loading';
import StatCard from './common/StatCard';
import {
  getShortId, isFavourite, getTimeseriesReadingKey, mergePendingAndSavedReadingsAndSort,
} from '../utils';
import { primary, bgMed, primaryLight, bgLight, primaryText, bgLightHighlight, secondary, } from '../utils/Colors';
import { Reading, OWTimeseries, TimeseriesRange, TimeseriesReadings, TimeSeriesReading, PendingReadingsByTimeseriesName } from '../typings/models/OurWater';
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
import { TranslationFile } from 'ow_translations';
import { AnyReading } from '../typings/models/Reading';
import { AnyResource } from '../typings/models/Resource';
import { AnyTimeseries } from '../typings/models/Timeseries';
import { OrgType } from '../typings/models/OrgType';
import { PendingReading } from '../typings/models/PendingReading';
import TimeseriesSummaryText from './common/TimeseriesSummaryText';
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
  // favouriteResources: AnyResource[],
  favourite: boolean,
  translation: TranslationFile,
  pendingReadings: PendingReading[],
}

export interface ActionProps {
  action_addFavourite: any,
  action_removeFavourite: any,
  getReadings: (api: BaseApi, resourceId: string, timeseriesName: string, timeseriesId: string, range: TimeseriesRange) => any,
}

export interface State {

}

class ResourceDetailSection extends React.PureComponent<OwnProps & StateProps & ActionProps> {
  appApi: BaseApi;
  state: State = {}

  constructor(props: OwnProps & StateProps & ActionProps) {
    super(props);

    this.appApi = this.props.config.getAppApi();
    
    
    this.loadTimeseries();
  }

  componentDidUpdate(prevProps: OwnProps & StateProps & ActionProps, prevState: State) {
    if (prevProps.resource.id !== this.props.resource.id) {
      this.loadTimeseries();
    }
  }

  loadTimeseries() {
    const DEFAULT_RANGE = TimeseriesRange.EXTENT;
    const { resource: { id, timeseries } } = this.props;
    timeseries.forEach((ts: AnyTimeseries) => this.props.getReadings(this.appApi, id, ts.name, ts.id, DEFAULT_RANGE));
  }


  getHeadingBar() {
    const { resource, translation: { templates: { }} } = this.props;
    const { resource_detail_name_label, resource_detail_heading_label } = this.props.translation.templates;
    const showSubtitle = this.props.config.getResourceDetailShouldShowSubtitle();

    let title;
    if (resource.type === OrgType.GGMN) {
      title = resource.title;
    } else {
      title = resource.owner.name;
    }

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
          <Text style={{ color: primaryText, fontSize: 17, fontWeight: '800' }}>{`${resource_detail_heading_label} ${getShortId(resource.id)}`}</Text>
          { showSubtitle ? 
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}>
              <Text style={{ color: primaryText, fontSize: 13, fontWeight: '100' }}>{`${resource_detail_name_label}: ${title}`}</Text>
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
    const { timeseries_name_title, timeseries_date_format, timeseries_none} = this.props.translation.templates;

    let loading = false;
    const readingsMap = new Map<string, AnyReading[]>();

    resource.timeseries.forEach(ts => {
      const key = getTimeseriesReadingKey(resource.id, ts.name, TimeseriesRange.EXTENT);
      const tsReading: TimeSeriesReading | undefined = tsReadings[key]
      if (!tsReading) {
        return <Loading />
      }

      //Let's say two weeks is the default, and should always be either there or pending
      if (tsReading.meta.loading) {
        loading = true;
      }

      //TODO: add pending readings?
      readingsMap.set(ts.name, tsReading.readings);
    });

    if (loading) {
      return <Loading/>
    }

    const keys = [...readingsMap.keys()];
    
    if (keys.length === 0) {
      return (
        <Text style={{textAlign: 'center'}}>{timeseries_none}</Text>
      );
    }
    
    return (
      keys.map((key) => {
        const readings = readingsMap.get(key) || [];
        const pendingReadings = this.props.pendingReadings.filter(r => r.timeseriesId === key);
        const allReadings = mergePendingAndSavedReadingsAndSort(pendingReadings, readings);

        let content = 'N/A';
        let contentSubtitle;
        let timeStart;
        let timeEnd;

        const latestReading = allReadings[allReadings.length - 1];
        if (latestReading) {
          content = `${latestReading.value.toFixed(2)}`;
          // TODO: translate
          contentSubtitle = moment(latestReading.dateString).format(timeseries_date_format);
        }

        //This may fail...
        const timeseries = resource.timeseries.filter(t => t.name === key)[0];
        if (!timeseries) { 
          return null
        };

        if (timeseries.type === OrgType.GGMN) {
          timeStart = moment(timeseries.firstReadingDateString).format(timeseries_date_format);
        }
        return (
          <TimeseriesSummaryText 
            key={key} 
            heading={timeseries.name} 
            subtitle={timeseries_name_title(timeseries.name)}
            content={content}
            content_subtitle={contentSubtitle}
            // Removing these for now, it't too hard to get the start date
            // timeStart={timeStart}
            // timeEnd={timeEnd}
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
          flex: 1,
        }}>
          <View style={{
            flexDirection: 'column',
            flex: 5,
            justifyContent: 'center',
          }}>
            {this.getLatestReadingsForTimeseries()}
          </View>

          {/* Bottom Buttons */}
          <View style={{
            flex: 0.5,
            borderColor: bgLightHighlight,
            borderTopWidth: 1,
            flexDirection: 'row-reverse',
            paddingBottom: 20,
            alignContent: 'center',
            // maxHeight: 50,
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
        flex: 20,
        backgroundColor: bgMed,
      }}>
        <ScrollableTabView 
          style={{ 
            paddingTop: 0,
          }}
          containerStyle={{
            marginBottom: 20,
          }}
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
              flex: 1,
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
                      pendingReadings={this.props.pendingReadings.filter(r => r.timeseriesId === ts.name)}
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
    const { favourite, favouriteResourcesMeta } = this.props;
  

    let iconName = 'star-half';
    if (favourite) {
      iconName = 'star';
    }

    return (
      <FlatIconButton
        style={{
          marginTop: 9,
          height: '100%',
        }}
        // use star-outlined when not a fav
        name={iconName}
        onPress={() => this.toggleFavourites()}
        color={secondary}
        isLoading={favouriteResourcesMeta.loading}
      />
    );
  }

  async toggleFavourites() {
    const { favourite } = this.props;
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
        {this.props.hideTopBar ? null : this.getHeadingBar()}
        {this.getReadingsView()}
      </View>
    );
  }
};

const mapStateToProps = (state: AppState, ownProps: OwnProps): StateProps =>  {
  const favourite = isFavourite(state.favouriteResources, ownProps.resource.id);

  return {
    favouriteResourcesMeta: state.favouriteResourcesMeta,
    // favouriteResources: state.favouriteResources,
    favourite,
    tsReadings: state.tsReadings,
    translation: state.translation,
    pendingReadings: state.pendingSavedReadings.filter(r => r.resourceId === ownProps.resource.id),
  }
}

const mapDispatchToProps = (dispatch: any): ActionProps => {
  return {
    action_addFavourite: (api: BaseApi, userId: string, resource: AnyResource) => 
      dispatch(appActions.addFavourite(api, userId, resource)),
    action_removeFavourite: (api: BaseApi, userId: string, resourceId: string) =>
      dispatch(appActions.removeFavourite(api, userId, resourceId)),
    getReadings: (api: BaseApi, resourceId: string, timeseriesName: string, timeseriesId: string, range: TimeseriesRange) => 
      dispatch(appActions.getReadings(api, resourceId, timeseriesName, timeseriesId, range)),

  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ResourceDetailSection);