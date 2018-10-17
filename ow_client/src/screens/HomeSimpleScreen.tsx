import * as React from 'react';
import { Component } from 'react';
import { Text } from 'react-native-elements';
import { ConfigFactory } from '../config/ConfigFactory';
import BaseApi from '../api/BaseApi';
import { View, TouchableNativeFeedback } from 'react-native';
import { randomPrettyColorForId, navigateTo } from '../utils';
import { ResourceType } from '../enums';

export interface OwnProps {
  navigator: any;
  config: ConfigFactory,
  appApi: BaseApi,
}

export interface StateProps {
  userId: string,
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



  /**
   * A list of the reading options: Groundwater, Rainfall, Checkdam and Water Quality
   * 
   * //TODO: Load only the icons based on user's settings 
   */
  getMenuButtons() {

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
          {MenuButton('GROUNDWATER', () => presentResourceScreen('Wells', ResourceType.well))}
          {MenuButton('RAINFALL', () => presentResourceScreen('Raingauges', ResourceType.raingauge))}
        </View>
        <View style={{
          flexDirection: 'row',
          flex: 1,
        }}>
          {MenuButton('WATER QUALITY', () => presentResourceScreen('Water Quality', ResourceType.quality))}
          {MenuButton('CHECKDAM', () => presentResourceScreen('Checkdams', ResourceType.checkdam))}
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

export default HomeSimpleScreen;