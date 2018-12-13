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
  getShortId, isFavourite, getTimeseriesReadingKey, mergePendingAndSavedReadingsAndSort, dedupArray, splitArray, groupArray, arrayHighest,
} from '../utils';
import { primary, bgMed, primaryLight, bgLight, primaryText, bgLightHighlight, secondary, } from '../utils/Colors';
import { Reading, OWTimeseries, TimeseriesRange, TimeseriesReadings, TimeSeriesReading, PendingReadingsByTimeseriesName } from '../typings/models/OurWater';
import { ConfigFactory } from '../config/ConfigFactory';
import BaseApi from '../api/BaseApi';
import HeadingText from './common/HeadingText';
import HeadingSubtitleText from './common/HeadingSubtitleText';
import FlatIconButton from './common/FlatIconButton';
import TimeseriesCard from './common/TimeseriesCard';

import { AppState, CacheType, AnyOrPendingReading } from '../reducers';
import * as appActions from '../actions/index';
import { connect } from 'react-redux'
import { SyncMeta, ActionMeta } from '../typings/Reducer';

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
import { ConfigTimeseries } from '../typings/models/ConfigTimeseries';
import { Maybe } from '../typings/MaybeTypes';
import { fromCommonResourceToFBResoureBuilder } from '../utils/Mapper';
import { diff } from 'deep-object-diff';
import { getDefaultSettings } from 'http2';
import TimeseriesCardSimple from './common/TimeseriesCardSimple';


export interface OwnProps {
  resourceId: string,
  //This is a hack to fix the issues with ids in GGMN
  temporaryGroundwaterStationId: string | null,
  config: ConfigFactory,
  hideTopBar: boolean,
  onAddReadingPressed: (resourceId: string) => any,
  onEditReadingsPressed: (resourceId: string) => any,
  onEditResourcePressed: (pendingResource: PendingResource) => any,
  isPending: boolean,
}

export interface StateProps {
  favouriteResourcesMeta: SyncMeta,
  favourite: boolean,
  translation: TranslationFile,
  pendingReadings: PendingReading[],
  userId: string,
  resource: Maybe<AnyResource>, 
  pendingResource: Maybe<PendingResource>,
  resourceMeta: ActionMeta,
  newTsReadings: Array<AnyOrPendingReading>,
  newTsReadingsMeta: ActionMeta,
  timeseriesList: CacheType<Array<AnyOrPendingReading>>,
}

export interface ActionProps {
  action_addFavourite: any,
  action_removeFavourite: any,
  getReadings: (api: BaseApi, resourceId: string, timeseriesName: string, timeseriesId: string, range: TimeseriesRange) => Promise<SomeResult<AnyReading[]>>,
  getResource: (api: BaseApi, resourceId: string, userId: string) =>  Promise<SomeResult<AnyResource>>,
}

export interface State {

}

class ResourceDetailSection extends React.PureComponent<OwnProps & StateProps & ActionProps> {
  appApi: BaseApi;
  state: State = {}

  constructor(props: OwnProps & StateProps & ActionProps) {
    super(props);

    this.appApi = this.props.config.getAppApi();

    this.reloadResourceAndReadings();
  }

  componentDidUpdate(prevProps: OwnProps & StateProps & ActionProps, prevState: State) {
    if (prevProps.resourceId !== this.props.resourceId) {
      this.reloadResourceAndReadings();
    }

    // const propsDiff = diff(originalObj, updatedObj)
  }

  async reloadResourceAndReadings() {
    const DEFAULT_RANGE = TimeseriesRange.EXTENT;
    const {
      resource_loading_error,
      timeseries_loading_error,
    } = this.props.translation.templates;

    let resourceId = this.props.resourceId;
    if (this.props.temporaryGroundwaterStationId) {
      resourceId = this.props.temporaryGroundwaterStationId;
    }

    if (this.props.isPending) {
      //Don't reload the resource if it is pending.
      return;
    }

    const result = await this.props.getResource(this.appApi, resourceId, this.props.userId);
    if (result.type === ResultType.ERROR) {
      ToastAndroid.show(`${resource_loading_error}`, ToastAndroid.LONG);
      return;
    }

    if (result.type === ResultType.SUCCESS) {
      result.result.timeseries.forEach((ts: AnyTimeseries) => this.props.getReadings(this.appApi, this.props.resourceId, ts.name, ts.id, DEFAULT_RANGE)
        .then(result => {
          if (result.type === ResultType.ERROR) {      
            ToastAndroid.show(`${timeseries_loading_error}`, ToastAndroid.LONG);
          }
        }));
    }
  }

  getDefaultTimeseries(): Array<ConfigTimeseries> {
    const { resource } = this.props;

    let resourceType = 'well';
    if (resource) {
      if (resource.type === OrgType.GGMN) {
        resourceType = 'well';
      }
      if (resource.type === OrgType.MYWELL) {
        resourceType = resource.resourceType;
      }
    }

    return this.props.config.getDefaultTimeseries(resourceType);
  }

  getHeadingBar() {
    const { resourceId, resource, pendingResource } = this.props;
    const { resource_detail_name_label, resource_detail_heading_label } = this.props.translation.templates;
    let showSubtitle = this.props.config.getResourceDetailShouldShowSubtitle();
    let title = '';

    //TD: remove these bad hacks
    if (resource) {
      if (resource.type === OrgType.GGMN) {
        title = resource.title;
      } else {
        title = resource.owner.name;
      }
    }

    if (pendingResource) {
      title = pendingResource.name;
    }

    if (title === resourceId) {
      showSubtitle = false;
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
          <Text style={{ color: primaryText, fontSize: 17, fontWeight: '800' }}>{`${resource_detail_heading_label} ${getShortId(resourceId)}`}</Text>
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
    const { newTsReadings, newTsReadingsMeta, resourceMeta, timeseriesList } = this.props;
    const { 
      timeseries_name_title, 
      timeseries_date_format, 
      timeseries_none,
      resource_loading_error,
      timeseries_loading_error
    } = this.props.translation.templates;


    if (resourceMeta.loading || newTsReadingsMeta.loading) {
      return <Loading/>
    }

    if (resourceMeta.error) {
      return (
        <View>
          <Text style={{ textAlign: 'center' }}>{resource_loading_error}</Text>
        </View>
      )
    }

    if (newTsReadingsMeta.error) {
      return (
        <View>
          <Text style={{ textAlign: 'center' }}>{timeseries_loading_error}</Text>
        </View>
      )
    }

    if (newTsReadings.length === 0) {
      return (
        <View>
          <Text style={{ textAlign: 'center' }}>{timeseries_none}</Text>
        </View>
      );
    }

    return Object.keys(timeseriesList).map((key: string) => {
      const readings: Array<AnyOrPendingReading> = timeseriesList[key];

      let content = 'N/A';
      let contentSubtitle;
    
      const latestReading = arrayHighest<AnyOrPendingReading>(readings, (r) => r.date);
      content = `${latestReading.value.toFixed(2)}`;
      contentSubtitle = moment(latestReading.date).format(timeseries_date_format);

      return (
        <TimeseriesSummaryText 
          key={key} 
          heading={key} 
          subtitle={timeseries_name_title(key)}
          content={content}
          content_subtitle={contentSubtitle}
        />
      )
    });
  }

  getSummaryCard() {
    const { resource_detail_edit_resource, resource_detail_latest, resource_detail_new_reading_button, resource_detail_edit_readings } = this.props.translation.templates;
    const { resourceId, pendingResource, isPending} = this.props;

    const allowEditReadings = this.props.config.getResourceDetailEditReadings();
    const allowEdit = this.props.config.getResourceDetailAllowEditing();


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
            flex: 0.5,
            borderColor: bgLightHighlight,
            borderTopWidth: 1,
            flexDirection: 'row-reverse',
            alignContent: 'center',
            minHeight: 30,
            maxHeight: 40,
          }}>
            {!isPending && this.getFavouriteButton()}
            <ResourceDetailBottomButton
              title={resource_detail_new_reading_button}
              onPress={() => this.props.onAddReadingPressed(resourceId)}
              />
            {allowEditReadings && <ResourceDetailBottomButton
              title={resource_detail_edit_readings}
              onPress={() => this.props.onEditReadingsPressed(resourceId)}
            />}
           {allowEdit && pendingResource && <ResourceDetailBottomButton
              title={resource_detail_edit_resource}
              onPress={() => this.props.onEditResourcePressed(pendingResource)}
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
    const { resource_detail_summary_tab } = this.props.translation.templates;
    const { timeseriesList } = this.props;
    const defaultTimeseriesList: Array<ConfigTimeseries> = this.getDefaultTimeseries();

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
            Object.keys(timeseriesList).map(key => {
              const timeseries = defaultTimeseriesList.filter(ts => ts.parameter === key)[0];
              if (!timeseries) {
                console.warn("No timeseries found for key and defaultTimeseriesList", key, defaultTimeseriesList);
                return;
              }

              return (
                // @ts-ignore
                <View tabLabel={`${timeseries.name}`} key={timeseries.name} style={{ alignItems: 'center' }}>
                  <TimeseriesCardSimple
                    config={this.props.config}
                    timeseries={timeseries}
                    resourceId={this.props.resourceId}
                    timeseriesId={key}
                    isPending={this.props.isPending}
                  />
                </View>
              )
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
          onPress={() => this.props.onAddReadingPressed(this.props.resourceId)}
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

    return await this.props.action_removeFavourite(this.appApi, this.props.userId, this.props.resourceId);
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
  const favourite = isFavourite(state.favouriteResources, ownProps.resourceId);

  const resource = state.resourcesCache[ownProps.resourceId];
  let pendingResource: Maybe<PendingResource>;
  if (ownProps.isPending) {
    const filteredPendingResources = state.pendingSavedResources.filter(r => r.id === ownProps.resourceId);
    if (filteredPendingResources.length > 0) {
      pendingResource = filteredPendingResources[0];
    }
  }
  let resourceMeta;
  if (ownProps.temporaryGroundwaterStationId) {
    resourceMeta = state.resourceMeta[ownProps.temporaryGroundwaterStationId];
  } else {
    resourceMeta = state.resourceMeta[ownProps.resourceId];
  }
  
  //If we have no resource and no resourceMeta and no pendingResource, then we must be loading
  if (!resource && !resourceMeta && !pendingResource) {
    resourceMeta = { loading: true, error: false, errorMessage: '' };
  }

  //TODO: clean this up
  if (!resourceMeta) {
    if (!pendingResource) {
      resourceMeta = { loading: true, error: false, errorMessage: '' };
    } else {
      resourceMeta = { loading: false, error: false, errorMessage: '' };
    }
  }

  if (resourceMeta.error && ownProps.isPending) {
    resourceMeta = { loading: false, error: false, errorMessage: '' };
  }

  const newTsReadings = state.newTsReadings[ownProps.resourceId] || [];
  let newTsReadingsMeta = state.newTsReadingsMeta[ownProps.resourceId];
  if (!newTsReadingsMeta && ownProps.isPending === false) {
    newTsReadingsMeta = { loading: false, error: false, errorMessage: '' };
  }

  if (!newTsReadingsMeta) {
    newTsReadingsMeta = { loading: false, error: false, errorMessage: '' };
  }

  const timeseriesList = groupArray<AnyOrPendingReading>(newTsReadings, (r) => r.timeseriesId);

  console.log(`ResourceDetailSection has ${newTsReadings.length} readings`);

  return {
    favouriteResourcesMeta: state.favouriteResourcesMeta,
    favourite,
    translation: state.translation,
    pendingReadings: state.pendingSavedReadings.filter(r => r.resourceId === ownProps.resourceId),
    userId: state.user.type === UserType.NO_USER ? '' : state.user.userId,
    resource,
    pendingResource,
    resourceMeta,
    newTsReadings,
    newTsReadingsMeta,
    timeseriesList,
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
    getResource: (api: BaseApi, resourceId: string, userId: string) => 
      dispatch(appActions.getResource(api, resourceId, userId))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ResourceDetailSection);