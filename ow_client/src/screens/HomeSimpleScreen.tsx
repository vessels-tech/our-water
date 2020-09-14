import * as React from 'react';
import { Component } from 'react';
import { ConfigFactory } from '../config/ConfigFactory';
import BaseApi from '../api/BaseApi';
import { View } from 'react-native';
import { navigateTo, showModal } from '../utils';
import { ResourceType } from '../enums';
import { connect } from 'react-redux'
import { AppState } from '../reducers';
import { UserType } from '../typings/UserTypes';
import { TranslationFile } from 'ow_translations';
import MenuButton from '../components/common/MenuButton';
import { menuColors, primaryText, primaryLight } from '../utils/NewColors';
import Toolbar from '../components/common/Toolbar';
import IconButton from '../components/common/IconButton';
//@ts-ignore
import EventEmitter from "react-native-eventemitter";
import { SearchButtonPressedEvent } from '../utils/Events';
import { PlaceResult, PartialResourceResult, SearchResultType } from 'ow_common/lib/api/SearchApi';
import { getOrElse } from 'ow_common/lib/utils';

import withPreventDoubleClick from '../components/common/withPreventDoubleClick';

const IconButtonEx = withPreventDoubleClick(IconButton);
const MenuButtonEx = withPreventDoubleClick(MenuButton);

export interface OwnProps {
  config: ConfigFactory,
  appApi: BaseApi,
}

export interface StateProps {
  userId: string,
  menu_well: string,
  menu_rainfall: string,
  menu_water_quality: string,
  menu_checkdam: string,
  settings_new_resource: string,
  translation: TranslationFile,
  image: string | null
}

export interface ActionProps {

}


class HomeSimpleScreen extends Component<OwnProps & StateProps & ActionProps> {

  constructor(props: OwnProps & StateProps & ActionProps) {
    super(props);

    this.onSearchResultPressed = this.onSearchResultPressed.bind(this);
    EventEmitter.addListener(SearchButtonPressedEvent, this.onNavigatorEvent.bind(this));
  }

  componentWillUnmount() {
    EventEmitter.removeAllListeners(SearchButtonPressedEvent);
  }

  onNavigatorEvent(event: any) {
    const { translation: { templates: { search_heading } } } = this.props;

    if (event === 'SEARCH') {
      navigateTo(this.props, 'screen.SearchScreen', search_heading, {
        config: this.props.config,
        userId: this.props.userId,
        // TODO: AnyResource needs to be something else
        onSearchResultPressed: this.onSearchResultPressed,
        onSearchResultPressedV1: this.onSearchResultPressed
      });
    }
  }

  /**
   * Handle when a user clicks a result from the search screen.
   *
   */
  async onSearchResultPressed(r: PartialResourceResult | PlaceResult): Promise<void> {
    const {
      settings_map
    } = this.props.translation.templates;

    switch(r.type) {
      case SearchResultType.PartialResourceResult: {
        navigateTo(this.props, 'screen.SimpleResourceDetailScreen', getOrElse(r.shortId, ". . ."), {
          resourceId: r.id,
          config: this.props.config,
          userId: this.props.userId
        });
        break;
      }
      case SearchResultType.PlaceResult: {
        navigateTo(
          this.props,
          'screen.SimpleMapScreen',
          settings_map,
          {
            config: this.props.config,
            initialRegion: {
              latitude: r.coords.latitude,
              longitude: r.coords.longitude,
              //TODO: improve this calculation to make more accurate to the
              // latitudeDelta: Math.abs(r.boundingBox[0] - r.boundingBox[2]) / 2,
              // longitudeDelta: Math.abs(r.boundingBox[1] - r.boundingBox[3]) / 2,
              latitudeDelta: 10,
              longitudeDelta: 10,
            }
          }
        )

        break;
      }
    }
  }

  /**
   * A list of the reading options: Groundwater, Rainfall, Checkdam and Water Quality
   *
   * //TODO: Load only the icons based on user's settings
   */
  getMenuButtons() {
    const { menu_well, menu_rainfall, menu_water_quality, menu_checkdam } = this.props;
    const {
      menu_browse_text,
      menu_scan_text,
      menu_search_text,
      menu_new_text,
      settings_map,
    } = this.props.translation.templates;

    const presentResourceScreen = (pluralResourceName: string, resourceType: ResourceType): void => {
      navigateTo(this.props, 'screen.SimpleResourceScreen', pluralResourceName, {
        config: this.props.config,
        userId: this.props.userId,
        resourceType
      });
    }

    return (
      <View
        style={{flex: 1}}
      >
        {/* Top Toolbar */}
        <Toolbar
          style={{flex: 2}}
          config={this.props.config}
        >
          <IconButtonEx
            textColor={primaryText.high}
            color={primaryLight}
            name={'map'}
            onPress={() => {

              navigateTo(
                this.props,
                'screen.SimpleMapScreen',
                settings_map,
                {
                  config: this.props.config,
                }
              )
            }}
            bottomText={menu_browse_text}
            size={17}
          />
          <IconButtonEx
            textColor={primaryText.high}
            color={primaryLight}
            name={'crop-free'}
            onPress={() => {
              navigateTo(this.props, 'screen.ScanScreen', menu_scan_text, {
                config: this.props.config,
              });
            }}
            bottomText={menu_scan_text}
            size={17}
          />
          <IconButtonEx
            textColor={primaryText.high}
            color={primaryLight}
            name={'create'}
            onPress={() => {
              const { settings_new_resource } = this.props;
              showModal(this.props, 'screen.menu.EditResourceScreen', settings_new_resource, {
                config: this.props.config,
                userId: this.props.userId,
                image: this.props.image
              })
            }}
            bottomText={menu_new_text}
            size={17}
          />
        </Toolbar>


        {/* Menu Buttons */}
        <View style={{
          flexDirection: 'column',
          flex: 10,
          width: '100%',
          height: '100%',
        }}>
          <View style={{
            flexDirection: 'row',
            flex: 1,
          }}>
            <MenuButtonEx
              color={menuColors[0]}
              name={menu_well}
              onPress={() => presentResourceScreen('Wells', ResourceType.well)}
            />
            <MenuButtonEx
              color={menuColors[1]}
              name={menu_rainfall}
              onPress={() => presentResourceScreen('Raingauges', ResourceType.raingauge)}
            />
          </View>
          <View style={{
            flexDirection: 'row',
            flex: 1,
          }}>
            <MenuButtonEx
              color={menuColors[2]}
              name={menu_water_quality}
              onPress={() => presentResourceScreen('Water Quality', ResourceType.quality)}
            />
            <MenuButtonEx
              color={menuColors[3]}
              name={menu_checkdam}
              onPress={() => presentResourceScreen('Checkdams', ResourceType.checkdam)}
            />
          </View>
        </View>
      </View>
    );
  }



  render() {
    return (
      <View style={{
        width: '100%',
        height: '100%',
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

  // const thingo = state.user.ego.thingo1;
  // thingo.doSmoething();

  if (state.user.type === UserType.USER) {
    userId = state.user.userId;
  }

  return {
    userId,
    menu_well: state.translation.templates.menu_well,
    menu_rainfall: state.translation.templates.menu_rainfall,
    menu_water_quality: state.translation.templates.menu_water_quality,
    menu_checkdam: state.translation.templates.menu_checkdam,
    settings_new_resource: state.translation.templates.settings_new_resource,
    translation: state.translation,
    image: state.image
  }
}

const mapDispatchToProps = (dispatch: any): ActionProps => {
  return {
  }
}

// export default connect(mapStateToProps, mapDispatchToProps)(HomeSimpleScreen);

// const enhance = compose(
//   withTabWrapper,
//   connect(mapStateToProps, mapDispatchToProps),
// );

// export default enhance(HomeSimpleScreen);

export default connect(mapStateToProps, mapDispatchToProps, null, { renderCountProp: 'renderCounter' })(HomeSimpleScreen);
