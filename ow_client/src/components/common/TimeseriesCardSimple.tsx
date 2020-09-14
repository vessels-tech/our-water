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
import { getTimeseriesReadingKey, filterAndSort, getHeadingForTimeseries, hashReadingId } from '../../utils';
import SimpleChart, { SpecificChart } from './SimpleChart';
import { isNullOrUndefined, isNull } from 'util';
import { AnyTimeseries } from '../../typings/models/Timeseries';
import { PendingReading } from '../../typings/models/PendingReading';
import { OrgType } from '../../typings/models/OrgType';
import { AnyReading } from '../../typings/models/Reading';
import { ConfigTimeseries } from '../../typings/models/ConfigTimeseries';
import { ActionMeta } from '../../typings/Reducer';
import { surfaceLight } from '../../assets/ggmn/NewColors';
import { surface, surfaceDark, surfaceText, secondary } from '../../utils/NewColors';
import moment from 'moment';
import { TranslationFile } from 'ow_translations';
import { ResourceType } from '../../enums';
import { calculateOneYearChunkedReadings } from './ChartHelpers';
import { ReadingImageType } from '../../typings/models/ReadingImage';
import { safeGetNestedDefault, safeGetNested } from 'ow_common/lib/utils';
import { ReadingApi } from 'ow_common/lib/api';
import FlatIconButton from './FlatIconButton';
import { goToURL } from './Link';


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
  resourceType: ResourceType,
  children?: React.ReactChild,
  openLocalReadingImage: (fileUrl: string) => void,
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

export enum ViewImageButtonType {
  None='None',
  Local='Local',
  Remote='Remote',
}

export const ViewImageButton = ({ 
  reading, 
  openLocalReadingImage, 
  readingImageUrlBuilder 
}: { reading: AnyOrPendingReading, openLocalReadingImage: (fileUrl: string) => void, readingImageUrlBuilder: (id: string) => string}) => {
  let buttonType: ViewImageButtonType = ViewImageButtonType.None;

  const fileUrl = safeGetNestedDefault(reading, ['image', 'fileUrl'], null);
  if (fileUrl) {
    if (safeGetNested(reading, ['isResourcePending'])) {
      buttonType = ViewImageButtonType.Local;
   } else {
     //This will have fileUrl, but we have no guarantees about it
     buttonType = ViewImageButtonType.Remote;
   }
  } 

  const readingId = hashReadingId(reading.resourceId, reading.timeseriesId, reading.date);
  const openUrl = readingImageUrlBuilder(readingId);
  const buttonStyle = {};

  return (
    <View
      style={{
        width: 25,
      }}
    >
      {buttonType === ViewImageButtonType.Remote && 
        <FlatIconButton 
          style={{
            ...buttonStyle,
          }}
          name={'open-in-new'}
          onPress={() => goToURL(openUrl)}
          color={secondary}
          isLoading={false}
          // size={32}
        />
      }
      {buttonType === ViewImageButtonType.Local && 
        <FlatIconButton 
          style={{
           ...buttonStyle,
          }}
          name={'open-in-new'}
          onPress={() => openLocalReadingImage(fileUrl)}
          color={secondary}
          isLoading={false}
          // size={32}
        />
      }
    </View>
  );
}

/**
 *  TimeseriesCard is a card that displays a timeseries graph,
 *  along with some basic controls for changing the time scale
 */
class TimeseriesCardSimple extends Component<OwnProps & StateProps & ActionProps> {
  appApi: BaseApi;
  state: State;
  chunkedReadings: Array<Array<AnyOrPendingReading>> = [[]];

  constructor(props: OwnProps & StateProps & ActionProps) {
    super(props);

    /* Set the default buttons */
    const buttons = props.config.getResourceDetailGraphButtons();
    const currentRange = buttons[buttons.length - 1].value;
    this.state = {
      currentRange,
    }

    /* calcualte the chunked readings */
    this.chunkedReadings = calculateOneYearChunkedReadings(filterAndSort(props.tsReadings, TimeseriesRange.THREE_YEARS));

    //@ts-ignore
    this.appApi = this.props.config.getAppApi();
  }

  componentWillReceiveProps(nextProps: OwnProps & StateProps & ActionProps, nextContext: any) {
    if (this.props.tsReadings.length !== nextProps.tsReadings.length) {
      this.chunkedReadings = calculateOneYearChunkedReadings(filterAndSort(nextProps.tsReadings, TimeseriesRange.THREE_YEARS));
    }
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
    const { cardType, tsReadings, newTsReadingsMeta, timeseries: { unitOfMeasure }} = this.props;
    if (cardType !== TimeseriesCardType.graph) {
      return null;
    }
    const strictDateMode = this.props.config.getResourceDetailGraphUsesStrictDate();

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
        {/* SpecificChart is a wrapper around SimpleChart that does some nice configration */}
        <SpecificChart
          readings={filteredReadings}
          //An array of readings to be used for multi-range graphs
          chunkedReadings={this.chunkedReadings}
          resourceType={this.props.resourceType}
          timeseriesRange={currentRange} 
          strictDateMode={strictDateMode}
          translation={this.props.translation}
          unitOfMeasure={unitOfMeasure}
        />
      </View>
    );
  }

  getTableView() {
    const { currentRange } = this.state;
    const { cardType, tsReadings, newTsReadingsMeta, timeseries: { unitOfMeasure } } = this.props;
    const { 
      default_datetime_format,
      reading_image_url_builder
    } = this.props.translation.templates;

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
                <ViewImageButton 
                  reading={item}
                  openLocalReadingImage={(fileUrl: string) => this.props.openLocalReadingImage(fileUrl)}
                  readingImageUrlBuilder={reading_image_url_builder}
                />
              </View> 
            )
          }}
        />
      </View>
    );
  }

  getBottomButtons() {
    const buttons = this.props.config.getResourceDetailGraphButtons();

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
    const { resourceType, timeseries: { name } } = this.props;

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
          {getHeadingForTimeseries(resourceType, name)}
        </Text>
        {this.getGraphView()}
        {this.getTableView()}
        {this.props.children}
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