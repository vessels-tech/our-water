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
import { Resource, SearchResult } from '../typings/models/OurWater';
import { ResourceType } from '../enums';
import { getDemoResources } from '../utils';
import { ConfigFactory } from '../config/ConfigFactory';
import BaseApi from '../api/BaseApi';
import Loading from '../components/Loading';
import {debounce} from 'throttle-debounce';
// import { debounce } from "debounce";

export interface Props {
  navigator: any;
  config: ConfigFactory,
  userId: string,
}

export interface State {
  searchQuery: string,
  results: Resource[], //This may be more than just resources in the future
  recentSearches: string[],
  isLoading: boolean,
  error: boolean,
  errorMessage: string
}

export default class SearchScreen extends Component<Props> {
  state: State;
  appApi: BaseApi;
  debouncedPerformSearch: any;

  constructor(props: Props) {
    super(props);

    this.appApi = props.config.getAppApi();
    this.state = {
      searchQuery: '',
      results: [],
      recentSearches: [],
      isLoading: false,
      error: false,
      errorMessage: '',
    };

    this.appApi.getRecentSearches(this.props.userId)
    .then(recentSearches => this.setState({recentSearches}));
  }


  getSearchBar() {

    return (
      <View>
        <SearchBar
          lightTheme
          noIcon
          onChangeText={(searchQuery) => {
            this.setState({ searchQuery });
            // console.log("text changed");
            //TODO: figure out how to debounce properly
            this.performSearch();
          }}
          // onEndEditing={() => this.performSearch()}
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
   * TODO: refactor to be offline search?
   */
  performSearch() {
    console.log("performing search");
    const { searchQuery } = this.state;

    let result: SearchResult;
    let resources: Resource[];
    
    this.setState({isLoading: true});

    return this.appApi.performSearch(searchQuery)
    .then(_result => result = _result)
    .then(() => {
      console.log("search finished");
      resources = result.resources;

      //TODO: if results are larger than 0, save the search!
      if (resources.length > 0) {
        console.log("save recent search!");
        return this.appApi.saveRecentSearch(this.props.userId, searchQuery)
        //Non-critical error
        .catch(err => console.log("error saving search: ", err));
      }
    })
    .then(() => {
      this.setState({
        isLoading: false,
        error: false,
        results: resources,
      });
    })
    .catch(err => {
      this.setState({
        isLoading: false,
        error: true,
        errorMessage: 'Something went wrong with your search. Please try again.',
      });
    });
  }

  /**
   * Display the search results, in a series of cards and grids
   * similar to google maps.
   */
  getSearchResults() {
    const { results, isLoading, error, errorMessage } = this.state;

    const resources: Resource[] = getDemoResources();

    if (isLoading) {
      return <View><Loading/></View>
    }

    if (error) {
      return <View>
        <Text>{errorMessage}</Text>
      </View>
    };

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
