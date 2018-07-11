import React, { Component } from 'react';
import {
  ActivityIndicator,
  View,
  TextInput,
  ViewPagerAndroid
} from 'react-native';
import { 
  Avatar,
  Button,
  Card, 
  Icon,
  Text,
} from 'react-native-elements';
import PropTypes from 'prop-types';

import Loading from './Loading';
import IconButton from './IconButton';
import StatCard from './common/StatCard';
import {
  getShortId,
} from '../utils';
import FirebaseApi from '../api/FirebaseApi';
import Config from 'react-native-config';
import { primary, textDark, bgMed } from '../utils/Colors';

const orgId = Config.REACT_APP_ORG_ID;


class ResourceDetailSection extends Component<Props> {

  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      resource: {
        lastValue: '',
      }
    }
  }

  componentWillMount() {
    const { resource: { id }, userId } = this.props; 

    //TODO: load the readings for this resource
    //todo: find out if in favourites

    this.setState({
      loading: true
    });
  
    //Listen to updates from Firebase
    this.unsubscribe = FirebaseApi.getResourceListener({orgId, resourceId: id, onSnapshot: (data) => this.onSnapshot(data)});

    //TODO: we need to reload this when changing resources.
    return Promise.all([
      FirebaseApi.isInFavourites({orgId, userId, resourceId: id})
    ])
    .then(([isFavourite]) => {

      this.setState({
        isFavourite, 
        loading:false
      });
    });
  }

  onSnapshot(data) {
    this.setState({
      resource: data,
    });
  }

  componentWillUpdate() {
    console.log('willUpdate');
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  getReadingsView() {
    const { loading, resource: { lastValue } } = this.state;

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
        <View style={viewStyle}>
          <Loading/>
        </View>
      );
    }

    return (
      // <View style={viewStyle}>
        <ViewPagerAndroid
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
    const { isLoading, isFavourite } = this.state;

    if (isLoading) {
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
        onPress={() => this.toggleFavourites(this.props.resource)}
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
          titleStyle={{ 
            fontWeight: 'bold', 
            fontSize: 23,
          }}
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
      isLoading: true,
    });

    return Promise.resolve(true)
    .then(() => {
      //TODO: don't keep of track of state ourselves, use firebase callbacks
      if (isFavourite) {
        return FirebaseApi.removeFavouriteResource({ orgId, resource, userId })
      }

      return FirebaseApi.addFavouriteResource({ orgId, resource, userId });
    })
    .then(() => {
      this.setState({
        isLoading: false,
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
        titleStyle={{ fontWeight: 'bold', fontSize: 23 }}
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
            size="large"
            // rounded
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

ResourceDetailSection.propTypes = {
  resource: PropTypes.object.isRequired,
  onMorePressed: PropTypes.func.isRequired,
  onAddToFavourites: PropTypes.func.isRequired,
  onRemoveFromFavourites: PropTypes.func.isRequired,
  onAddReadingPressed: PropTypes.func.isRequired,
  userId: PropTypes.string.isRequired,
};

export default ResourceDetailSection;