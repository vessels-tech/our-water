import * as React from 'react'; import { Component } from 'react';
import { connect } from 'react-redux'
import { AppState } from '../reducers';
import NetworkStatusBanner from '../components/NetworkStatusBanner';
import * as appActions from '../actions/index';
import { UserType } from '../typings/UserTypes';
import { ConfigFactory } from '../config/ConfigFactory';
import { PendingReading } from '../typings/models/PendingReading';
import { SyncMeta } from '../typings/Reducer';
import BaseApi from '../api/BaseApi';
import { TranslationFile } from 'ow_translations';
import { View, ScrollView, Button } from 'react-native';
import { Text } from 'react-native-elements';
import { bgLight, primaryDark } from '../utils/Colors';
import ReadingListItem from '../components/common/ReadingListItem';
import { AnyResource } from '../typings/models/Resource';
import { PendingResource } from '../typings/models/PendingResource';
import { navigateTo, unwrapUserId } from '../utils';
import { navigateToNewReadingScreen } from '../utils/NavigationHelper';


export interface OwnProps {
  navigator: any,
  config: ConfigFactory,
  resourceId: string,
  resourceType: string,
  isResourcePending: boolean,
}

export interface StateProps {
  userId: string,
  pendingReadings: PendingReading[],
  pendingReadingsMeta: SyncMeta,
  translation: TranslationFile,
}

export interface ActionProps {
  deletePendingReading: (api: BaseApi, userId: string, pendingReadingId: string, resourceId: string) => any,
}

export interface State {

}


class EditReadingsScreen extends Component<OwnProps & StateProps & ActionProps> {
  appApi: BaseApi;

  constructor(props: OwnProps & StateProps & ActionProps) {
    super(props);

    this.appApi = this.props.config.getAppApi();

    /* binds */
    this.deletePendingReading = this.deletePendingReading.bind(this);
    this.onAddReadingPressed = this.onAddReadingPressed.bind(this);
  }

  deletePendingReading(id: string) {
    this.props.deletePendingReading(this.appApi, this.props.userId, id, this.props.resourceId);
  }

  onAddReadingPressed() {
    const { resource_detail_new } = this.props.translation.templates;
    navigateToNewReadingScreen(this.props, resource_detail_new, {
      navigator: this.props.navigator,
      groundwaterStationId: null,
      resourceId: this.props.resourceId,
      resourceType: this.props.resourceType,
      // isResourcePending: this.props.isResourcePending,
      config: this.props.config,
    });
  }
  
  getReadingsSection() {
    const {
      pendingReadings,
      translation: {
        templates: {
          sync_section_resources,
          sync_section_readings,
          sync_date_format,
        }
      },
    } = this.props;

    if (pendingReadings.length === 0) {
      return null;
    }

    return (
      <View>
        <Text
          style={{
            paddingLeft: 16,
            paddingTop: 7,
            paddingBottom: 3,
            fontWeight: "600",
            color: primaryDark,
          }}
        >{sync_section_readings}</Text>
        {pendingReadings.map((reading, idx) => 
          <ReadingListItem
            key={idx}
            deletePendingReading={this.deletePendingReading}
            pendingReading={reading}
            sync_date_format={sync_date_format}
            unitSuffix=" m"
          />
        )}
      </View>
    );
  }

  render() {
    const { pendingReadings } = this.props;

    if (pendingReadings.length === 0) {
      return (
        <View style={{
          flex: 1,
          alignSelf: 'center',
          justifyContent: 'center',
          width: '50%',
          height: '100%',
        }}>
          <Text style={{ textAlign: "center", fontWeight: 'bold', paddingBottom: 10, }}>{'No Readings for this Station'}</Text>
          <Button onPress={this.onAddReadingPressed} title="New Reading"/>
        </View>
      );
    }

    return (
      <View style={{
        flexDirection: 'column',
        height: '100%',
      }}>
        <ScrollView style={{ backgroundColor: bgLight }}>
          {this.getReadingsSection()}
        </ScrollView>
      </View>
    );
  }

}

//If we don't have a user id, we should load a different app I think.
const mapStateToProps = (state: AppState, ownProps: OwnProps): StateProps => {
  const pendingReadings: PendingReading[] = state.pendingSavedReadings.filter(r => r.resourceId === ownProps.resourceId);

  return {
    userId: unwrapUserId(state.user),
    pendingReadings,
    pendingReadingsMeta: state.pendingSavedReadingsMeta,
    translation: state.translation,
  }
}

const mapDispatchToProps = (dispatch: any): ActionProps => {
  return {
    deletePendingReading: (api: BaseApi, userId: string, pendingReadingId: string, resourceId: string) =>
      dispatch(appActions.deletePendingReading(api, userId, pendingReadingId, resourceId))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(EditReadingsScreen);