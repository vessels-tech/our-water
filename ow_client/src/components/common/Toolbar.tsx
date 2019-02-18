import * as React from 'react'; import { Component } from 'react';
import {
  Avatar,
  Button,
  Card,
  Text,
  Divider,
} from 'react-native-elements';
import { OWTimeseries, Reading, TimeseriesRange, TimeseriesRangeReadings, TimeseriesReadings } from '../../typings/models/OurWater';
import { View, FlatList, ViewProperties, ViewProps, StyleProp, ViewStyle } from 'react-native';
import { primaryLight, primaryDark, bgLight, bgLightHighlight } from '../../utils/Colors';
import LineChartExample from './DemoChart';
import { SomeResult } from '../../typings/AppProviderTypes';
import Loading from './Loading';
import { ConfigFactory } from '../../config/ConfigFactory';
import BaseApi from '../../api/BaseApi';

import { AppState, AnyOrPendingReading } from '../../reducers';
import * as appActions from '../../actions/index';
import { connect } from 'react-redux'
import { getTimeseriesReadingKey, filterAndSort } from '../../utils';
import SimpleChart from './SimpleChart';
import { isNullOrUndefined, isNull } from 'util';
import { AnyTimeseries } from '../../typings/models/Timeseries';
import { PendingReading } from '../../typings/models/PendingReading';
import { OrgType } from '../../typings/models/OrgType';
import { AnyReading } from '../../typings/models/Reading';
import { ConfigTimeseries } from '../../typings/models/ConfigTimeseries';
import { ActionMeta } from '../../typings/Reducer';
import { surfaceLight } from '../../assets/ggmn/NewColors';
import { surface, surfaceDark, surfaceText } from '../../utils/NewColors';
import moment = require('moment');
import { TranslationFile } from 'ow_translations';


export interface OwnProps {
  config: ConfigFactory,
  children: any,
  // onButtonPressed: (idx: number) => void,
  // style: StyleProp<ViewStyle>,
  style: any,
}

export interface StateProps {
  translation: TranslationFile,
}

export interface ActionProps {

}

export interface State {

}

/**
 *  TimeseriesCard is a card that displays a timeseries graph,
 *  along with some basic controls for changing the time scale
 */
class Toolbar extends Component<OwnProps & StateProps & ActionProps> {
  appApi: BaseApi;
  state: State = {
  }

  constructor(props: OwnProps & StateProps & ActionProps) {
    super(props);

    //@ts-ignore
    this.appApi = this.props.config.getAppApi();
  }

  

  render() {
    return (
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-around',
          marginHorizontal: 20,
          ...this.props.style,
        }}
      >
       {this.props.children}
      </View>
    );
  }
}

const mapStateToProps = (state: AppState, ownProps: OwnProps): StateProps => {
  
  return {
    translation: state.translation,
  }
}

const mapDispatchToProps = (dispatch: any): ActionProps => {
  return {

  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Toolbar);