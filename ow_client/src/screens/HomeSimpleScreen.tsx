import * as React from 'react';
import { Component } from 'react';
import { Text } from 'react-native-elements';
import { ConfigFactory } from '../config/ConfigFactory';
import BaseApi from '../api/BaseApi';
import { View, TouchableNativeFeedback } from 'react-native';
import { randomPrettyColorForId } from '../utils';

export interface OwnProps {
  navigator: any;
  config: ConfigFactory,
  appApi: BaseApi,
}

export interface StateProps {

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
   * //TODO: Load based on user's settings 
   */
  getMenuButtons() {
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
          {MenuButton('GROUNDWATER', ()=> console.log("groundwater Pressed"))}
          {MenuButton('RAINFALL', () => console.log("Rainfall Pressed"))}
        </View>
        <View style={{
          flexDirection: 'row',
          flex: 1,
        }}>
          {MenuButton('WATER QUALITY', () => console.log("water quality Pressed"))}
          {MenuButton('CHECKDAM', () => console.log("Checkdam Pressed"))}
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