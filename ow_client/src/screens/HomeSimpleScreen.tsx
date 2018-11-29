import * as React from 'react';
import { Component } from 'react';
import { Text } from 'react-native-elements';
import { ConfigFactory } from '../config/ConfigFactory';
import BaseApi from '../api/BaseApi';
import { View, TouchableNativeFeedback } from 'react-native';
import { randomPrettyColorForId, navigateTo } from '../utils';
import { ResourceType } from '../enums';
import { connect } from 'react-redux'
import { AppState } from '../reducers';
import { UserType } from '../typings/UserTypes';
import { withTabWrapper } from '../components/TabWrapper';
import { compose } from 'redux';
import { TranslationFile } from 'ow_translations';


export interface OwnProps {
  navigator: any;
  config: ConfigFactory,
  appApi: BaseApi,
}

export interface StateProps {
  userId: string,
  translation: TranslationFile,
}

export interface ActionProps {

}

const MenuButton = (name: string, onPress: () => void,) => {
  return (
    <TouchableNativeFeedback
      style={{flex: 1}}
      onPress={() => onPress()}
    >
      <View style={{
        flex: 1,
        padding: 10,
        margin: 10,
        backgroundColor: randomPrettyColorForId(name),
      }}>
        <Text style={{fontWeight: '800', fontSize:20}}>{name}</Text>
      </View>
    </TouchableNativeFeedback>
  )
}

class HomeSimpleScreen extends Component<OwnProps & StateProps & ActionProps> {

  constructor(props: OwnProps & StateProps & ActionProps) {
    super(props);
  }

  /**
   * A list of the reading options: Groundwater, Rainfall, Checkdam and Water Quality
   * 
   * //TODO: Load only the icons based on user's settings 
   */
  getMenuButtons() {

    const { menu_well, menu_rainfall, menu_water_quality, menu_checkdam } = this.props.translation.templates;

    const presentResourceScreen = (pluralResourceName: string, resourceType: ResourceType): void => {
      navigateTo(this.props, 'screen.SimpleResourceScreen', pluralResourceName, {
        config: this.props.config,
        userId: this.props.userId,
        resourceType
      })
    }

    return (
      <View style={{
        flexDirection: 'column',
        flex: 1,
        width: '100%',
        height: '100%',
      }}>
        <View style={{
          flexDirection: 'row',
          flex: 1,
        }}>
          {/* TODO: translations */}
          {MenuButton(menu_well, () => presentResourceScreen('Wells', ResourceType.well))}
          {MenuButton(menu_rainfall, () => presentResourceScreen('Raingauges', ResourceType.raingauge))}
        </View>
        <View style={{
          flexDirection: 'row',
          flex: 1,
        }}>
          {MenuButton(menu_water_quality, () => presentResourceScreen('Water Quality', ResourceType.quality))}
          {MenuButton(menu_checkdam, () => presentResourceScreen('Checkdams', ResourceType.checkdam))}
        </View>
      </View>
    );
  }



  render() {
    return (
      <View style={{
        width: '100%',
        height: '100%',
        // backgroundColor: 'tomato',
        alignContent: 'center',
      }}>
        {this.getMenuButtons()}
      </View>
    )
  }

}


//If we don't have a user id, we should load a different app I think.
const mapStateToProps = (state: AppState, ownProps: OwnProps): StateProps => {
  let userId = ''; //I don't know if this fixes the problem...

  if (state.user.type === UserType.USER) {
    userId = state.user.userId;
  }

  return {
    userId,
    translation: state.translation,
  }
}

const mapDispatchToProps = (dispatch: any): ActionProps => {
  return {
  }
}

// export default connect(mapStateToProps, mapDispatchToProps)(HomeSimpleScreen);

const enhance = compose(
  withTabWrapper,
  connect(mapStateToProps, mapDispatchToProps),
);

export default enhance(HomeSimpleScreen);
