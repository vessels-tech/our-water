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


//If we don't have a user id, we should load a different app I think.
const mapStateToProps = (state: AppState, ownProps: OwnProps): StateProps => {
  let userId = ''; //I don't know if this fixes the problem...

  if (state.user.type === UserType.USER) {
    userId = state.user.userId;
  }

  return {
    userId,
  }
}

const mapDispatchToProps = (dispatch: any): ActionProps => {
  return {
    // addRecent: (api: BaseApi, userId: string, resource: Resource) => {
    //   dispatch(appActions.addRecent(api, userId, resource))
    // },
    // loadResourcesForRegion: (api: BaseApi, userId: string, region: Region) =>
    //   dispatch(appActions.getResources(api, userId, region)),
    // startExternalSync: (api: MaybeExternalServiceApi, userId: string) =>
    //   dispatch(appActions.startExternalSync(api, userId)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(HomeSimpleScreen);
