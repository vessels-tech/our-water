import * as React from 'react';
import { Component } from "react";
import {
  View, TouchableNativeFeedback, ScrollView, TouchableHighlight,
} from 'react-native';
import {
  Card,
  ListItem,
  SearchBar,
  Text,
} from 'react-native-elements';
import { Resource, SearchResult } from '../typings/models/OurWater';
import BaseApi from '../api/BaseApi';
import Loading from '../components/common/Loading';
import {debounce} from 'throttle-debounce';
import { AppContext } from '../AppProvider';
import { ConfigFactory } from '../config/ConfigFactory';
import { getGroundwaterAvatar } from '../utils';

// import { debounce } from "debounce";

export interface Props {
  onSearchResultPressed: any,

  navigator: any;

  //Injected from Provider
  isConnected: boolean,
  appApi: BaseApi,
  userId: string,
  config: ConfigFactory,
}

export interface State {
  searchQuery: string,
  results: Resource[], //This may be more than just resources in the future
  recentSearches: string[],
  isLoading: boolean,
  error: boolean,
  errorMessage: string
}

class SearchScreen extends Component<Props> {
  state: State;
  debouncedPerformSearch: any;

  constructor(props: Props) {
    super(props);

    this.state = {
      searchQuery: '',
      results: [],
      recentSearches: [], //TODO: get from provider
      isLoading: false,
      error: false,
      errorMessage: '',
    };

    // this.appApi.getRecentSearches(this.props.userId)
    // .then(recentSearches => this.setState({recentSearches}));
  }

  getSearchBar() {

    return (
      <SearchBar
        lightTheme
        noIcon
        onChangeText={(searchQuery) => {
          this.setState({ searchQuery });
          //TODO: figure out how to debounce properly
          this.performSearch();
        }}
        // onEndEditing={() => this.performSearch()}
        onClearText={() => console.log('clear text')}
        value={this.state.searchQuery}
        placeholder='Search' />
    );
  }

  /**
   * Perform the search for the given query
   * This is a placeholder implementation
   * 
   * TODO: refactor to handle offline search?
   */
  performSearch() {
    const { searchQuery } = this.state;

    let result: SearchResult;
    let resources: Resource[];
    
    this.setState({isLoading: true});

    return this.props.appApi.performSearch(searchQuery)
    .then(_result => result = _result)
    .then(() => {
      console.log("search finished");
      resources = result.resources;

      //TODO: if results are larger than 0, save the search!
      if (resources.length > 0) {
        console.log("save recent search!");
        return this.props.appApi.saveRecentSearch(this.props.userId, searchQuery)
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

    if (isLoading) {
      return (
        <View style={{
          justifyContent: 'center',
          height: 350,
        }}>
          <Loading/>
        </View>
      );
    }

    if (error) {
      return <View>
        <Text>{errorMessage}</Text>
      </View>
    };

    if (results.length === 0) {
      return null;
    }

    return (
      <View>
        {
          // TODO: fix this with a touchable native feedback
          results.map((r: Resource, i) => {
            return (
              <ListItem
                containerStyle={{
                  paddingLeft: 10,
                }}
                hideChevron
                key={i}
                onPress={() => {
                  this.props.navigator.pop();
                  this.props.onSearchResultPressed(r)
                }}
                roundAvatar
                title={r.id}
                avatar={getGroundwaterAvatar()}
                subtitle={r.owner.name}>
              </ListItem>
            );
          })
        }
      </View>
    );
  }

  getNoResultsFoundText() {
    const { searchQuery, results, isLoading } = this.state;

    if (isLoading) { 
      return null;
    }

    if (results.length > 0) {
      return null;
    }

    if (searchQuery.length === 0) {
      return null;
    }

    return (
      <View style={{
        flex: 1,
        alignSelf: 'center',
        justifyContent: 'center',
        width: '50%',
        height: '100%',
      }}>
        <Text style={{
          textAlign: "center"
        }}>
          No Results Found
          </Text>
      </View>
    );
  }

  getSearchHint() {
    const { searchQuery, results, isLoading, recentSearches } = this.state;

    if (isLoading) {
      return null;
    }

    if (recentSearches.length === 0 && searchQuery.length === 0) {
      return (
        <View style={{
          flex: 1,
          alignSelf: 'center',
          justifyContent: 'center',
          width: '50%',
          height: '100%',
        }}>
          <Text style={{
            textAlign: "center"
          }}
          >{this.props.config.getSearchHint()} </Text>
        </View>
      );
    }
  }

  getRecentSearches() {
    const { isLoading, recentSearches, results } = this.state;

    if (isLoading) {
      return null;
    }

    if (results.length > 0) {
      return null;
    }

    if (recentSearches.length === 0) {
      return null;
    }
  
    return (
      <View>
        <Card title="Recent Searches">
          {
            recentSearches.map((r, i) => {
              return (
                <ListItem
                  containerStyle={{
                    paddingLeft: 0,
                    marginLeft: 0,
                  }}
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
    );
  }

  getOfflineWarning() {
    const { isConnected } = this.props;
    console.log("SearchScreen is connected?", isConnected);

    if (isConnected === true) {
      return null;
    }

    return (
      <View>
        <Text>You are currently offline.</Text>
        <Text>Showing limited search results.</Text>
      </View>
    )
  }

  render() {

    /*
      no search + no recent searches         =>  Search Hint
      no search + recent searches            =>  Recent Searches
      search with results + any              =>  Search Results
      search no results + no recent searches =>  No Results Found
      search no results + recent searches    =>  No Results Found + Recent Searches
    */
    
    //TODO: add 'showing offline results only. Connect to mobile or wifi to get more accurate results'
    return (
      <View style={{
        flexDirection: 'column',
        // backgroundColor: 'pink',
        height: '100%'
      }}>
        {this.getSearchBar()}
        <ScrollView 
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps={'always'}
        >
          {this.getSearchResults()}
          {this.getNoResultsFoundText()}
          {this.getSearchHint()}
          {this.getRecentSearches()}
        </ScrollView>
        {/*TODO: implement this later on with more robust network detection  */}
        {/* {this.getOfflineWarning()} */}
      </View>
    );
  }
}

const SearchScreenWithContext = (props: any) => {
  return (
    <AppContext.Consumer>
      {({ isConnected, appApi, userId, config }) => {
        return (
        <SearchScreen
          appApi={appApi}
          isConnected={isConnected}
          userId={userId}
          config={config}
          {...props}
        />
      )}}
    </AppContext.Consumer>
  )
}
export default SearchScreenWithContext;