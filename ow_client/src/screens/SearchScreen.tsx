import * as React from 'react';
import { Component } from "react";
import {
  View, TouchableNativeFeedback,
} from 'react-native';
import {
  Card,
  ListItem,
  SearchBar,
  Text,
} from 'react-native-elements';
import { Resource } from '../typings/models/OurWater';
import { ResourceType } from '../enums';
import { getDemoResources } from '../utils';
import { ConfigFactory } from '../config/ConfigFactory';
import BaseApi from '../api/BaseApi';

export interface Props {
  navigator: any;
  config: ConfigFactory,
}

export interface State {
  searchQuery: string,
  results: Resource[], //This may be more than just resources in the future
  recentSearches: string[],
}

export default class SearchScreen extends Component<Props> {
  state: State;
  appApi: BaseApi;

  constructor(props: Props) {
    super(props);

    this.appApi = props.config.getAppApi();

    this.state = {
      searchQuery:'',
      results: [],
      recentSearches: ['12345'],
    }
  }

  getSearchBar() {

    return (
      <View>
        <SearchBar
          lightTheme
          noIcon
          onChangeText={(searchQuery) => this.setState({searchQuery})}
          onEndEditing={() => this.performSearch()}
          onClearText={() => console.log('clear text')}
          value={this.state.searchQuery}
          placeholder='Search' />
      </View>
    );
  }

  /**
   * Perform the search for the given query
   * This is a placeholder implementation
   * 
   * TODO: refactor to be offline search? and move to API?
   */
  async performSearch() {
    const { searchQuery } = this.state;

    const allResources: Resource[] = await 
    console.log("searching for:", searchQuery);
    console.log("all resouces length:", allResources.length);
    const filtered = allResources.filter(r => {
      return r.id.indexOf(searchQuery) > -1;
    });

    //TODO: if results are larger than 0, save the search!

    console.log("filtered resources length:", filtered.length);


    this.setState({results: filtered})
  }

  /**
   * Display the search results, in a series of cards and grids
   * similar to google maps.
   */
  getSearchResults() {
    const { results } = this.state;

    const resources: Resource[] = getDemoResources();

    if (results.length === 0) {
      return (
        <View>
          <Text>No Results Found</Text>
          {/* TODO: display recent searches */}
          {this.getRecentSearches()}
        </View>
      );
    }

    return (
      <View>
        <Card title="Results">
          {
            results.map((r, i) => {
              return (
                <ListItem
                  hideChevron
                  key={i}
                  onPress={() => console.log("pressed")}
                  roundAvatar
                  title={r.id}
                  avatar={{ uri: 'https://s3.amazonaws.com/uifaces/faces/twitter/brynn/128.jpg' }}
                />
              );
            })
          }
        </Card>
      </View>
    );
  }

  getRecentSearches() {
    const { recentSearches } = this.state;

    if (recentSearches.length === 0) {
      return (
        //TODO: formatting
        <View>
          <Text>Search hint</Text> 
        </View>
      );
    }

    return <View>
      <Card title="Recent Searches">
        {
          recentSearches.map((r, i) => {
            return (
              <ListItem
                hideChevron
                key={i}
                component={TouchableNativeFeedback}
                onPress={() => {
                  this.setState({searchQuery: r}, () => {this.performSearch()});
                }}
                roundAvatar
                title={r}
              />
            );
          })
        }
      </Card>
    </View>
  }

  render() {
    const { searchQuery } = this.state;
    
    //TODO: add 'showing offline results only. Connect to mobile or wifi to get more accurate results'
    return (
      <View>
        {this.getSearchBar()}
        {searchQuery.length === 0 ? 
          this.getRecentSearches() : 
          this.getSearchResults()
        }
      </View>
    );
  }

}