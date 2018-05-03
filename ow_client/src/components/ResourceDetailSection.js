import React, { Component } from 'react';
import {
  ActivityIndicator,
  Text,
  View,
  TextInput
} from 'react-native';
import { Button, Icon } from 'react-native-elements';
import PropTypes from 'prop-types';

import Loading from './Loading';
import IconButton from './IconButton';

class ResourceDetailSection extends Component<Props> {

  constructor(props) {
    super(props);

    this.state = {
      loading: false,
    }
  }

  componentWillMount() {
    //TODO: load the readings for this resource
  }

  getReadingsView() {
    const { loading } = this.state;

    if(loading) {
      return <Loading/>
    }

    return (
      <View style={{
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
      }}>
        <Text>At a glance stats</Text>
      </View>
    );
  }

  toggleFavourites() {
    console.log("toggle favs");
  }

  getMoreButton() {
    const { resource: { legacyId } } = this.props;

    if(!legacyId || legacyId === '') {
      return null;
    }

    return (
      <Button
        title='More'
        onPress={() => this.props.onMorePressed(this.props.resource)}
      />
    );
  }

  render() {
    console.log('resource is', this.props.resource);

    

    return (
      <View style={{
        flexDirection: 'column'
      }}>
        <Text>Well Title</Text>
        <Text>Owner Name</Text>
        {this.getReadingsView()}
        <View style={{
          flexDirection:'row'
        }}>
          <Button 
            title='New reading'
            onPress={() => this.props.onAddReadingPressed(this.props.resource)}
          />
          {this.getMoreButton()}
          <IconButton
            // use star-outlined when not a fav
            name="star"
            onPress={() => this.toggleFavourites(this.props.resource)}
            color="yellow"
          />
        </View>
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
};

export default ResourceDetailSection;