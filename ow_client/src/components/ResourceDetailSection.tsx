import * as React from 'react'; import { Component } from 'react';
import {
  View,
  ViewPagerAndroid
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
import { primary, textDark, bgMed } from '../utils/Colors';
import { Resource } from '../typings/models/OurWater';

const orgId = Config.REACT_APP_ORG_ID;

export interface Props {
  resource: Resource,
  userId: string,
  onAddReadingPressed: any,
  onMorePressed: any,
  onAddToFavourites: any,
  onRemoveFromFavourites: any,
}

export interface State {
  loading: boolean,
  isFavourite: boolean,
}

class ResourceDetailSection extends Component<Props> {
  unsubscribe: any;
  state: State = {
    loading: false,
    isFavourite: false,
  }

  constructor(props: Props) {
    super(props);
  }

  componentWillMount() {
    const { resource, userId } = this.props; 
    const { id } = resource;

    console.log("displaying resource:", resource);

    //TODO: load the readings for this resource
    //todo: find out if in favourites

    this.setState({
      loading: true
    });
  
    //Listen to updates from Firebase
    //TODO: re enable for MyWellApi
    // this.unsubscribe = FirebaseApi.getResourceListener(orgId, id,  (data: any) => this.onSnapshot(data));


    //TODO: we need to reload this when changing resources.
    //TODO: load more info about the resource (eg. timeseries) here.
    return Promise.all([
      FirebaseApi.isInFavourites(orgId, id, userId)
    ])
    .then(([isFavourite]) => {

      this.setState({
        isFavourite, 
        loading:false
      });
    });
  }

  onSnapshot(data: any) {
    this.setState({
      resource: data,
    });
  }

  componentWillUpdate() {

  }

  componentWillUnmount() {
    //TODO: re enable for MyWellApi
    // this.unsubscribe();
  }

  getReadingsView() {
    const { loading } = this.state;
    const { resource: {lastValue}} = this.props;

    const viewStyle = {
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'row',
      marginTop: 10,
      height: 260,
      backgroundColor: bgMed,
    };

    if(loading) {
      return (
        //@ts-ignore
        <View style={viewStyle}>
          <Loading/>
        </View>
      );
    }

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
            <Card
              containerStyle={{
                width: '90%',
                height: '90%',
                alignItems: 'center',
              }}
              title="At a Glance">
              <StatCard
                title="Latest Reading"
                value={lastValue}
              />
              <StatCard
                title="Village Average"
                value={'23.5 m'}
              /> 
            </Card>
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

  getFavouriteButton() {
    const { loading, isFavourite } = this.state;

    if (loading) {
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
        marginTop: 20,
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
        {this.getMoreButton()}
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

  toggleFavourites() {
    const { resource, userId } = this.props;
    const { isFavourite } = this.state;

    this.setState({
      loading: true,
    });

    return Promise.resolve(true)
    .then(() => {
      //TODO: don't keep of track of state ourselves, use firebase callbacks
      if (isFavourite) {
        return FirebaseApi.removeFavouriteResource(orgId, resource.id, userId)
      }

      return FirebaseApi.addFavouriteResource(orgId, resource, userId);
    })
    .then(() => {
      this.setState({
        loading: false,
        isFavourite: !isFavourite,
      });
    })
    .catch(err => {
      console.log('error in toggleFavourites', err);
      this.setState({loading: false});
    })
  
  }

  getMoreButton() {
    const { resource: { legacyId } } = this.props;

    if(!legacyId || legacyId === '') {
      return null;
    }

    return (
      <Button
        title='More'
        buttonStyle={{
          backgroundColor: primary,
          borderRadius: 5,
          flex: 1
        }}
        // titleStyle={{ fontWeight: 'bold', fontSize: 23 }}
        onPress={() => this.props.onMorePressed(this.props.resource)}
      />
    );
  }

  render() {    
    const { resource: { id, owner: {name}}} = this.props;
    
    return (
      <View style={{
        flexDirection: 'column',
        alignContent: 'center',
        // marginVertical: 20,
        // marginHorizontal: 20
      }}>
        <View style={{
          flexDirection: 'row',
          paddingTop: 10
        }}>
          <Avatar
            containerStyle={{ 
              marginTop: 20,
              marginLeft: 20,
             }}
            // size="large"
            title="RG"
            activeOpacity={0.7}
          />
          <View style={{
            paddingLeft: 20,
          }}>
            <Text h3>{`Id: ${getShortId(id)}`}</Text>
            <Text h4>{name}</Text>
          </View>
        </View>
      
        {this.getReadingsView()}
        {this.getButtonsView()}
      </View>
    );
  }
  
};

export default ResourceDetailSection;