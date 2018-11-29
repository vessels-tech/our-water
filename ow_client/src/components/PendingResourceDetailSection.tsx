import * as React from 'react'; import { Component } from 'react';
import {
  View,
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
  getShortId, isFavourite, getTimeseriesReadingKey,
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
import { TranslationFile } from 'ow_translations';
import { AnyResource } from '../typings/models/Resource';
import { AnyTimeseries } from '../typings/models/Timeseries';
import { PendingResource } from '../typings/models/PendingResource';
import { PendingReading } from '../typings/models/PendingReading';
import PendingTimeseriesCard from './common/PendingTimeseriesCard';
import { PendingTimeseries } from '../typings/models/PendingTimeseries';
import { ResourceDetailBottomButton } from './common/ResourceDetailBottomButtom';

export interface OwnProps {
  config: ConfigFactory,
  pendingResource: PendingResource,
  userId: string,
  onAddReadingPressed: (r: AnyResource | PendingResource) => any,
  onEditResourcePressed: (r: AnyResource | PendingResource) => any,
  onEditReadingsPressed: (r: AnyResource | PendingResource) => any,
  hideTopBar: boolean,
}

export interface StateProps {
  pendingReadings: PendingReading[]
  pendingReadingsMeta: SyncMeta,
  translation: TranslationFile,
  
}

export interface ActionProps {

}

export interface State {

}

class PendingResourceDetailSection extends Component<OwnProps & StateProps & ActionProps> {
  appApi: BaseApi;
  state: State = {}

  constructor(props: OwnProps & StateProps & ActionProps) {
    super(props);

    this.appApi = this.props.config.getAppApi();
  }


  getHeadingBar() {
    const { pendingResource: { id, name } } = this.props;
    const { resource_detail_name_label, resource_detail_heading_label } = this.props.translation.templates;
    let showSubtitle = this.props.config.getResourceDetailShouldShowSubtitle();
    if (!name || name === id) {
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
          <Text style={{ color: primaryText, fontSize: 17, fontWeight: '500' }}>{`${resource_detail_heading_label} ${id}`}</Text>
          {showSubtitle ?
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}>
              {/* TODO: input translation: resource_detail_name_label */}
              <Text style={{ color: primaryText, fontSize: 17, fontWeight: '100' }}>{`${resource_detail_name_label} ${name}`}</Text>
              {/* TODO: enable code? Most of the time it's the same as Name. */}
              {/* <Text style={{ color: textLight, fontSize: 17, fontWeight: '100', paddingLeft: 20 }}>Code: {name}</Text> */}
            </View>
            : null}
        </View>
      </View>
    )
  }

  statCardForTimeseries(key: string, ts: Reading[] | undefined) {
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
    const { pendingResource, pendingReadings } = this.props;
    const { timeseries_name_title, timeseries_date_format } = this.props.translation.templates;
    
    let loading = false;
    const readingsMap = new Map<string, PendingReading[]>();

    pendingResource.timeseries.forEach(ts => {
      readingsMap.set(ts.name, pendingReadings.filter(r => r.timeseriesId === ts.name));
    });

    if (loading) {
      return <Loading />
    }

    const keys = [...readingsMap.keys()];
    return (
      keys.map((key) => {
        const readings = readingsMap.get(key) || [];
        let content = 'N/A';
        let content_subtitle;

        const latestReading = readings[readings.length - 1];
        if (latestReading) {
          content = `${latestReading.value.toFixed(2)}`;
          content_subtitle = moment(latestReading.date).format(timeseries_date_format);
        }

        return (
          <HeadingSubtitleText
            key={key}
            heading={key}
            subtitle={timeseries_name_title(key)}
            content={content}
            content_subtitle={content_subtitle}
          />
        )
      })
    );
  }

  getSummaryCard() {

    const {
      resource_detail_latest,
      resource_detail_new_reading_button,
      resource_detail_edit_resource,
      resource_detail_edit_readings,
    } = this.props.translation.templates;

    const allowEdit = this.props.config.getResourceDetailAllowEditing();
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
          // backgroundColor: 'tomato',
          flex: 0.5,
          borderColor: bgLightHighlight,
          borderTopWidth: 1,
          flexDirection: 'row-reverse',
          // paddingBottom: 20,
          minHeight: 30,
          maxHeight: 40,
          alignContent: 'center',
        }}>
          <ResourceDetailBottomButton 
            title={resource_detail_new_reading_button}
            onPress={() => this.props.onAddReadingPressed(this.props.pendingResource)}
          />
          {allowEdit && <ResourceDetailBottomButton 
            title={resource_detail_edit_resource}
            onPress={() => this.props.onEditResourcePressed(this.props.pendingResource)}
          />}
          {allowEditReadings && <ResourceDetailBottomButton 
            title={resource_detail_edit_readings}
            onPress={() => this.props.onEditReadingsPressed(this.props.pendingResource)}
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
    const { pendingResource, translation: { templates: { resource_detail_summary_tab } } } = this.props;

    return (
      // @ts-ignore
      <ScrollableTabView
        style={{ 
          paddingTop: 0,
          flex: 1 
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
          pendingResource.timeseries.map((ts: PendingTimeseries, idx: number) => {
            return (
              // @ts-ignore
              <View tabLabel={`${ts.name}`} key={idx} style={{ alignItems: 'center' }}>
                <PendingTimeseriesCard
                  config={this.props.config}
                  pendingReadings={this.props.pendingReadings.filter(r => r.timeseriesId === ts.name)}
                  resourceId={this.props.pendingResource.id}
                  timeseries={ts}
                />
              </View>
            );
          })
        }
      </ScrollableTabView>
    );
  }

  getReadingButton() {
    const { resource_detail_new_reading_button } = this.props.translation.templates;

    return (
      <Button
        color={secondary}
        buttonStyle={{
          backgroundColor: bgLight,
          borderRadius: 5,
          flex: 1,
          marginTop: 6,
        }}
        title={resource_detail_new_reading_button}
        onPress={() => this.props.onAddReadingPressed(this.props.pendingResource)}
      />
    );
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

const mapStateToProps = (state: AppState, ownProps: OwnProps): StateProps => {

  return {
    pendingReadings: state.pendingSavedReadings.filter(r => r.resourceId === ownProps.pendingResource.id),
    pendingReadingsMeta: state.pendingSavedReadingsMeta,
    translation: state.translation,
  }
}

const mapDispatchToProps = (dispatch: any): ActionProps => {
  return {
    // action_addFavourite: (api: BaseApi, userId: string, resource: AnyResource) =>
    //   dispatch(appActions.addFavourite(api, userId, resource)),
    // action_removeFavourite: (api: BaseApi, userId: string, resourceId: string) =>
    //   dispatch(appActions.removeFavourite(api, userId, resourceId)),
    // getReadings: (api: BaseApi, resourceId: string, timeseriesId: string, range: TimeseriesRange) =>
    //   dispatch(appActions.getReadings(api, resourceId, timeseriesId, range)),

  }
}

export default connect(mapStateToProps, mapDispatchToProps)(PendingResourceDetailSection);