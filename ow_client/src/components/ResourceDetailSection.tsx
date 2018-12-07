import * as React from 'react'; import { Component } from 'react';
import {
  View,
  ViewPagerAndroid,
  ToastAndroid,
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

import { AppState, CacheType } from '../reducers';
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
import { UserType } from '../typings/UserTypes';
import { SomeResult, ResultType } from '../typings/AppProviderTypes';
import { ResourceDetailBottomButton } from './common/ResourceDetailBottomButtom';
import { PendingResource } from '../typings/models/PendingResource';
// import ScrollableTabView, { DefaultTabBar } from 'react-native-scrollable-tab-view';

// import * as ScrollableTabView from 'react-native-scrollable-tab-view';

//TODO: move
export type ConfigTimeseries = {
  name: string, 
  parameter: string,
  type: OrgType.NONE,
}

export interface OwnProps {
  config: ConfigFactory,
  resource: AnyResource,
  onAddReadingPressed: any,
  hideTopBar: boolean,
  onEditReadingsPressed: (r: AnyResource | PendingResource) => any,
}

export interface StateProps {
  tsReadings: TimeseriesReadings,
  favouriteResourcesMeta: SyncMeta,
  // favouriteResources: AnyResource[],
  favourite: boolean,
  translation: TranslationFile,
  pendingReadings: PendingReading[],
  userId: string,
}

export interface ActionProps {
  action_addFavourite: any,
  action_removeFavourite: any,
  getReadings: (api: BaseApi, resourceId: string, timeseriesName: string, timeseriesId: string, range: TimeseriesRange) => Promise<SomeResult<AnyReading[]>>,
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

  onUpdateTimeseries() {
    this.loadTimeseries();
  }

  loadTimeseries() {
    const DEFAULT_RANGE = TimeseriesRange.EXTENT;
    const { resource: { id, timeseries } } = this.props;

    //Always load the default timeseries - that way we don't miss out on pending readings
    return this.loadDefaultTimeseries()

    //Not sure if we will want this back
    //TODO: this makes it impossible to create new timeseries here... have to figure this out
    if (timeseries.length === 0) {
      return this.loadDefaultTimeseries();
    }
    timeseries.forEach((ts: AnyTimeseries) => this.props.getReadings(this.appApi, id, ts.name, ts.id, DEFAULT_RANGE)
      .then(result => {
        if (result.type === ResultType.ERROR) {
          ToastAndroid.show(`Error loading readings: ${result.message}`, ToastAndroid.LONG);
        }
      }));
  }

  getDefaultTimeseries(): Array<ConfigTimeseries> {
    const { resource, pendingReadings, tsReadings } = this.props;
    let resourceType = 'well';
    if (resource.type === OrgType.MYWELL) {
      resourceType = resource.resourceType;
    }

    //TODO: ideally we shouldn't do this lookup here
    if (resource.type === OrgType.GGMN) {
      //Get the timeseries only for the pending or real readings
      const tsNames: CacheType<boolean> = {};
      resource.timeseries.forEach(ts => tsNames[ts.name.toLowerCase()] = true);
      pendingReadings.forEach(r => tsNames[r.timeseriesId.toLowerCase()] = true);
    
      
      const defaultTimeries: Array<ConfigTimeseries> = this.props.config.getDefaultTimeseries(resourceType);
      //Only load the timeseries which we have the ids of in pending or real readings

      return defaultTimeries.filter(ts => Object.keys(tsNames).indexOf(ts.parameter.toLowerCase()) > -1);
    }

    return this.props.config.getDefaultTimeseries(resourceType);
  }

  loadDefaultTimeseries() {
    const DEFAULT_RANGE = TimeseriesRange.EXTENT;
    const { resource } = this.props;
    const timeseries = this.getDefaultTimeseries();
    timeseries.forEach(ts => this.props.getReadings(this.appApi, resource.id, ts.name, ts.parameter, DEFAULT_RANGE));
    // TD: renenable. not having timeseries is a non fatal error
      // .then(result => {
        // if (result.type === ResultType.ERROR) {
        //   ToastAndroid.show(`Error loading readings: ${result.message}`, ToastAndroid.LONG);
        // }
      // }));
  }

  getHeadingBar() {
    const { resource } = this.props;
    const { resource_detail_name_label, resource_detail_heading_label } = this.props.translation.templates;
    let showSubtitle = this.props.config.getResourceDetailShouldShowSubtitle();
    let name;
    if (resource.type === OrgType.GGMN) {
      name = resource.name;
    }
    if (!name || name === resource.id) {
      showSubtitle = false;
    }

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
              <Text style={{ color: primaryText, fontSize: 13, fontWeight: '100' }}>{`${resource_detail_name_label} ${title}`}</Text>
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
    const readingsMap: CacheType<AnyReading[]> = {};

    /* use default timeseries if we have none */
    let timeseries: Array<ConfigTimeseries> = this.getDefaultTimeseries();

    /* figure out if we are loading */
    timeseries.forEach((ts: AnyTimeseries | ConfigTimeseries) => {
      const key = getTimeseriesReadingKey(resource.id, ts.name, TimeseriesRange.EXTENT);
      const tsReading: TimeSeriesReading | undefined = tsReadings[key]
      if (!tsReading) {
        return <Loading />
      }

      //Let's say two weeks is the default, and should always be either there or pending
      if (tsReading.meta.loading) {
        loading = true;
      }

      readingsMap[ts.name.toLowerCase()] = tsReading.readings;
    });

    if (loading) {
      return <Loading/>
    }
    
    if (timeseries.length === 0) {
      return (
        <Text style={{textAlign: 'center'}}>{timeseries_none}</Text>
      );
    }
    
    return (
      timeseries.map(ts => {
        const key = ts.name.toLowerCase();
        const readings = readingsMap[key] || [];
        const pendingReadings = this.props.pendingReadings.filter(r => r.timeseriesId.toLowerCase() === key.toLowerCase());
        const allReadings = mergePendingAndSavedReadingsAndSort(pendingReadings, readings);
        
        let content = 'N/A';
        let contentSubtitle;


        const latestReading = allReadings[allReadings.length - 1];
        if (latestReading) {
          content = `${latestReading.value.toFixed(2)}`;
          contentSubtitle = moment(latestReading.dateString).format(timeseries_date_format);
        }

        //This may fail...
        // const timeseries = resource.timeseries.filter(t => t.name === key)[0];
        const filteredTs = timeseries.filter(t => t.name.toLowerCase() === key)[0];
        if (!filteredTs) { 
          return null
        };

        return (
          <TimeseriesSummaryText 
            key={key} 
            heading={filteredTs.name} 
            subtitle={timeseries_name_title(filteredTs.name)}
            content={content}
            content_subtitle={contentSubtitle}
          />
        )
      })
    );
  }

  getSummaryCard() {
    const { translation: { templates: { resource_detail_latest, resource_detail_new_reading_button, resource_detail_edit_readings }}} = this.props;
    const allowEditReadings = this.props.config.getResourceDetailEditReadings();

    return (
        <View style={{
          flexDirection: 'column',
          height: '100%',
          padding: 20,
          flex: 1,
        }}>
          <View style={{
            flexDirection: 'column',
            flex: 2,
          }}>
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
            // backgroundColor: 'blue',
            flex: 0.5,
            borderColor: bgLightHighlight,
            borderTopWidth: 1,
            flexDirection: 'row-reverse',
            alignContent: 'center',
            minHeight: 30,
            maxHeight: 40,
          }}>
            {this.getFavouriteButton()}

            {/* TODO: remove */}
            {/* {this.getReadingButton()} */}
            <ResourceDetailBottomButton
              title={resource_detail_new_reading_button}
              onPress={() => this.props.onAddReadingPressed(this.props.resource)}
            />
          {allowEditReadings && <ResourceDetailBottomButton
            title={resource_detail_edit_readings}
            onPress={() => this.props.onEditReadingsPressed(this.props.resource)}
          />}
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

    /* use default timeseries if we have none */
    let timeseries: Array<AnyTimeseries | ConfigTimeseries> = this.getDefaultTimeseries();

    //Don't ever use the resource's own timeseries - otherwise users can't see pending readings
    // if (resource.timeseries.length > 0) {
    //   timeseries = resource.timeseries;
    // }

    return (
      // @ts-ignore
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
            timeseries.map((ts: AnyTimeseries | ConfigTimeseries, idx: number) => {
              return (
                // @ts-ignore
                <View tabLabel={`${ts.name}`} key={idx} style={{ alignItems: 'center' }}>
                  <TimeseriesCard
                    config={this.props.config}
                    resourceId={this.props.resource.id}
                    timeseries={ts}
                    pendingReadings={this.props.pendingReadings.filter(r => r.timeseriesId.toLowerCase() === ts.name.toLowerCase())}
                  />
                </View>
              );
            })
          }
      </ScrollableTabView>
    );
  }

  getReadingButton() {
    const { resource_detail_new_reading } = this.props.translation.templates;
    return (
      <View
        style={{
          marginTop: 7,
        }}
      >
        <Button
          color={secondary}
          buttonStyle={{
            backgroundColor: bgLight,
            borderRadius: 5,
            height: '100%',
          }}
          containerViewStyle={{
            alignSelf: 'center',
            justifyContent: 'center',
          }}
          title={resource_detail_new_reading}
          onPress={() => this.props.onAddReadingPressed(this.props.resource)}
        />
      </View>
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
          marginTop: 2,
          height: '100%',
        }}
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
        <View style={{
          flex: 20,
          backgroundColor: bgMed,
        }}>
          {this.getReadingsView()}
        </View>
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
    userId: state.user.type === UserType.NO_USER ? '' : state.user.userId,
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