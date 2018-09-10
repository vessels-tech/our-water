import * as React from 'react'; import { Component } from 'react';
import {
  View,
  ViewPagerAndroid,
  TouchableNativeFeedback
} from 'react-native';
import { 
  Avatar,
  Button,
  Card, 
  Text,
} from 'react-native-elements';

import Loading from './Loading';
import IconButton from './IconButton';
import StatCard from './common/StatCard';
import {
  getShortId,
} from '../utils';
import FirebaseApi from '../api/FirebaseApi';
import Config from 'react-native-config';
import { primary, textDark, bgMed, primaryDark, bgDark, primaryLight, bgDark2, textLight, bgLight, textMed } from '../utils/Colors';
import { Resource, Reading, OWTimeseries } from '../typings/models/OurWater';
import { ConfigFactory } from '../config/ConfigFactory';
import BaseApi from '../api/BaseApi';
import { GGMNTimeseries } from '../typings/models/GGMN';
import * as moment from 'moment';
import HeadingText from './common/HeadingText';
import { AsyncMeta, AppContext } from '../AppProvider';
import { S_IFIFO } from 'constants';

const orgId = Config.REACT_APP_ORG_ID;

export interface Props {
  config: ConfigFactory,
  resource: Resource,
  userId: string,
  onAddReadingPressed: any,
  onMorePressed: any,
  onAddToFavourites: any,
  onRemoveFromFavourites: any,

  favouriteResourcesMeta: AsyncMeta,
  favouriteResources: Resource[],
  action_addFavourite: any,
  action_removeFavourite: any,
}

export interface State {
  loading: boolean,
  readingsMap: Map<string, Reading[]> //key = timeseriesId, value = Reading[]
}

class ResourceDetailSection extends Component<Props> {
  unsubscribe: any;
  appApi: BaseApi;
  state: State = {
    loading: false,
    readingsMap: new Map<string, Reading[]>(),
  }

  constructor(props: Props) {
    super(props);

    this.appApi = this.props.config.getAppApi();
  }

  componentWillMount() {
    const { resource, userId } = this.props; 
    const { id } = resource;

    //TODO: load the readings for this resource
    //todo: find out if in favourites

    this.setState({
      loading: true
    });
  
    //Listen to updates from Firebase
    //TODO: re enable for MyWellApi
    // this.unsubscribe = FirebaseApi.getResourceListener(orgId, id,  (data: any) => this.onSnapshot(data));

    //TODO: we need to reload this when changing resources.
  
    //TODO: make configurable
    const today: number = moment().valueOf();
    const twoYearsAgo: number = moment().subtract(2, 'years').valueOf();

    //Get all readings for each timeseries
    //TODO: refactor to the AppApi, this is a little heavy.
    if (!resource.timeseries) {
      console.log("ERROR: no resource.timeseries!");
    }

    const readingsMap = new Map<string, Reading[]>();
    return Promise.all(resource.timeseries.map((t: OWTimeseries ) => 
      this.appApi.getReadingsForTimeseries(id, t.id, twoYearsAgo, today)
    ))
    .then((readingArrays: Reading[][]) => {
      readingArrays.forEach((readings: Reading[], idx: number)  => {
        const timeseriesId = resource.timeseries[idx].id;
        readingsMap.set(timeseriesId, readings);
      });

      return this.appApi.getPendingReadingsForResourceId(this.props.userId, id);
    })
    .then((pendingReadings: Reading[]) => {
      //Merge together pending readings with GGMN readings
      pendingReadings.forEach((r: Reading) => {
        const readingList: Reading[] | undefined  = readingsMap.get(r.timeseriesId);
        if (!readingList) {
          return;
        }

        readingList.push(r);
        readingsMap.set(r.timeseriesId, readingList);
      });
    
      return this.appApi.isResourceInFavourites(id, userId);
    })
    .then((isFavourite: boolean) => {
      this.setState({
        isFavourite, 
        readingsMap,
        loading:false
      });
    })
    .catch((err: Error) => {
      console.log("error", err);
      this.setState({
        loading: false,
      });
    });
  }

  onSnapshot(data: any) {
    this.setState({
      resource: data,
    });
  }

  getHeadingBar() {
    const { resource: { id, owner: { name } } } = this.props;

    return (
      <View style={{
        flexDirection: 'row',
        paddingVertical: 10,
        backgroundColor: primaryDark
      }}>
        <Avatar
          containerStyle={{
            marginLeft: 15,
            backgroundColor: primaryLight,
            alignSelf: 'center',
          }}
          rounded
          // size="large"
          title="GW"
          activeOpacity={0.7}
        />
        <View style={{
          paddingLeft: 15,
          alignSelf: 'center',
        }}>
          <Text style={{ color:textLight, fontSize: 17, fontWeight: '500' }}>{`Id: ${getShortId(id)}`}</Text>
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}>
            <Text style={{ color: textLight, fontSize: 17, fontWeight: '100' }}>Name: {name}</Text>
            <Text style={{ color: textLight, fontSize: 17, fontWeight: '100', paddingLeft: 20 }}>Code: {name}</Text>
          </View>
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

  dep_getLatestReadingsPerTimeseries() {
    const { readingsMap } = this.state;

    const keys = [... readingsMap.keys() ];
    return keys.map(key => this.statCardForTimeseries(key, readingsMap.get(key)));
  }

  getLatestReadingsForTimeseries() {
    const {readingsMap, loading} = this.state;

    if (loading) {
      return null;
    }

    const keys = [...readingsMap.keys()];
    return keys.map(key => {
      const value = readingsMap.get(key);
      return (
        <HeadingText key={key} heading={key} content={`${value}`}/>
      )
    });
  }

  /**
   * Iterate through favourite resources, and find out
   * if this is in the list
   */
  isFavourite() {
    const { favouriteResources, resource: { id } } = this.props;

    const ids = favouriteResources.map(r => r.id);
    if (ids.indexOf(id) > -1) {
      return true;
    }

    return false;
  }

  getSummaryCard() {
    return (
      <Card
        containerStyle={{
          width: '90%',
          height: '90%',
        }}
        // style={{
        //   width: '90%',
        //   height: '90%',
        //   marginHorizontal: 10,
        //   marginVertical: 10,
        //   paddingHorizontal: 5,
        //   paddingVertical: 5,
        //   borderColor: textLight,
        //   borderWidth: 2,
        //   borderRadius: 2,

        //   // alignItems: 'center',
        // }}
      >
        <View style={{
          flexDirection: 'column',
          // flex: 1
        }}>
          <HeadingText heading={'Station Type:'} content={'TODO'}/>
          <HeadingText heading={'Status'} content={'TODO'}/>
          <Text style={{
            paddingTop: 10, 
            textDecorationLine: 'underline', 
            fontSize: 15, 
            fontWeight: '600', 
            alignSelf:'center'
            }}>
            Latest Readings:
            {this.getLatestReadingsForTimeseries()}
          </Text>
          {/* Bottom Buttons */}
          <View style={{
            width: '50%',
            height: 30,
            position: 'absolute',
            right: 20,
            bottom: 0,
            borderColor: textLight,
            borderTopWidth: 2,
            flexDirection: 'row',
            marginRight: 10,
          }}>
            {/* {this.getFavouriteButton()}
            {this.getReadingButton()} */}
          </View>
        </View>
      </Card>
    );
  }

  getReadingsView() {
    const { resource: {lastValue}} = this.props;

    const viewStyle = {
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'row',
      height: 425, //TODO: figure out this height
      backgroundColor: bgLight,
    };

    return (
        <ViewPagerAndroid
          //@ts-ignore
          style={{
            flex: 1,
            ...viewStyle
          }}
          initialPage={0}
        >
          <View key="1" style={{
              alignItems: 'center',
            }}>
            {this.getSummaryCard()}
          </View>

          <View key="2" style={{
            alignItems: 'center',
          }}>
            <Card
              containerStyle={{
                width: '90%',
                height: '90%',
                alignItems: 'center',
              }}
              title="Past Readings">
            </Card>
          </View>

          <View key="3" style={{
            alignItems: 'center',
          }}>
            <Card
              containerStyle={{
                width: '90%',
                height: '90%',
                alignItems: 'center',
              }}
              title="Rainfall">
            </Card>
          </View>
        </ViewPagerAndroid>
    );
  }

  getReadingButton() {
    return (
      <Button
        color={primaryDark}
        buttonStyle={{
          backgroundColor: bgLight,
          borderRadius: 5,
          flex: 1
        }}
        // titleStyle={{ 
        //   fontWeight: 'bold', 
        //   fontSize: 23,
        // }}
        title='NEW READING'
        onPress={() => this.props.onAddReadingPressed(this.props.resource)}
      />
    );
  }

  getFavouriteButton() {
    const { favouriteResourcesMeta } = this.props;
    const isFavourite = this.isFavourite();

    if (favouriteResourcesMeta.loading) {
      return <Loading/>;
    }

    let iconName = 'star-half';
    if (isFavourite) {
      iconName = 'star';
    }

    return (
      <IconButton
        // use star-outlined when not a fav
        name={iconName}
        onPress={() => this.toggleFavourites()}
        color={primary}
      />
    );
  }

  getButtonsView() {

    return (
      <View style={{
        flexDirection: 'row',
        backgroundColor: primaryDark,
      }}>
        <Button
          color={textDark}
          buttonStyle={{
            backgroundColor: primary,
            borderRadius: 5,
            flex: 1
          }}
          // titleStyle={{ 
          //   fontWeight: 'bold', 
          //   fontSize: 23,
          // }}
          title='New reading'
          onPress={() => this.props.onAddReadingPressed(this.props.resource)}
        />
        <View
          style={{
            flex: 1,
            alignItems: 'center'
          }}>
          {this.getFavouriteButton()}
        </View>
      </View>
    );
  }

  async toggleFavourites() {
    const isFavourite = this.isFavourite();

    this.setState({isFavourite: !isFavourite});

    if (!isFavourite) {
      return await this.props.action_addFavourite(this.props.resource)
    }

    return await this.props.action_removeFavourite(this.props.resource.id);
  }

  render() {        
    return (
      <View style={{
        flexDirection: 'column',
      }}>
        {this.getHeadingBar()}
        {/* {this.getReadingsView()} */}
        {this.getButtonsView()}
      </View>
    );
  }
};


const ResourceDetailSectionWithContext = (props: any) => {
  return (
    <AppContext.Consumer>
      {({
        favouriteResources, 
        favouriteResourcesMeta, 
        action_addFavourite,
        action_removeFavourite,
      }) => (
        <ResourceDetailSection
          favouriteResources={favouriteResources}
          favouriteResourcesMeta={favouriteResourcesMeta}
          action_addFavourite={action_addFavourite}
          action_removeFavourite={action_removeFavourite}
          {...props}
        />
      )}
    </AppContext.Consumer>
  );
};
export default ResourceDetailSectionWithContext;