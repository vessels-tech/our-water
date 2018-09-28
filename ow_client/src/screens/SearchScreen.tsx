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
import { ConfigFactory } from '../config/ConfigFactory';
import { getGroundwaterAvatar } from '../utils';
import { AppState } from '../reducers';
import { connect } from 'react-redux';
import { SyncMeta, ActionMeta } from '../typings/Reducer';
import { SomeResult } from '../typings/AppProviderTypes';
import * as appActions from '../actions';
import { GGMNSearchEntity } from '../typings/models/GGMN';

export interface OwnProps {
  onSearchResultPressed: any,
  navigator: any;
  userId: string,
  config: ConfigFactory,
}

export interface StateProps {
  isConnected: boolean,
  recentSearches: string[],
  searchResults: GGMNSearchEntity[], //This may be more than just resources in the future
  searchResultsMeta: ActionMeta
}

export interface ActionProps { 
  performSearch: (api: BaseApi, userId: string, searchQuery: string, page: number) => SomeResult<void>
}

export interface State {
  searchQuery: string,
  hasSearched: boolean,
  page: number,
}

class SearchScreen extends Component<OwnProps & StateProps & ActionProps> {
  state: State;
  appApi: BaseApi;
  debouncedPerformSearch: any;

  constructor(props: OwnProps & StateProps & ActionProps) {
    super(props);

    //@ts-ignore
    this.appApi = props.config.getAppApi();

    this.state = {
      searchQuery: '',
      hasSearched: false,
      page: 1,
    };
  }

  getSearchBar() {

    return (
      <SearchBar
        lightTheme
        noIcon
        onChangeText={(searchQuery) => this.setState({ searchQuery, hasSearched: false })}
        onEndEditing={() => this.performSearch()}
        onClearText={() => console.log('clear text')}
        value={this.state.searchQuery}
        placeholder='Search' />
    );
  }

  /**
   * Perform the search for the given query
   */
  async performSearch() {
    const { searchQuery, page } = this.state;
  
    this.setState({hasSearched: true});
    await this.props.performSearch(this.appApi, this.props.userId, searchQuery, page);
  }

  async loadMore() {
    const { page } = this.state;
    this.setState({page});

    return this.performSearch();
  }

  /**
   * Display the search results, in a series of cards and grids
   * similar to google maps.
   */
  getSearchResults() {
    const { searchResults, searchResultsMeta: { loading, error, errorMessage } } = this.props;


    if (loading) {
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

    if (searchResults.length === 0) {
      return null;
    }

    return (
      <View>
        {
          // TODO: fix this with a touchable native feedback
          searchResults.map((r: GGMNSearchEntity, i) => {
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
                >
              </ListItem>
            );
          })  
        }
        {/* TODO: only display if we have 25 results */}
        <ListItem
          containerStyle={{
            paddingLeft: 10,
          }}
          hideChevron
          key={'load_more'}
          onPress={() => {
            this.loadMore()
          }}
          title={'More'}
        />
      </View>
    );
  }

  getNoResultsFoundText() {
    const { hasSearched } = this.state;
    const { searchResults, searchResultsMeta: { loading } } = this.props;

    if (loading) { 
      return null;
    }

    if (searchResults.length > 0) {
      return null;
    }

    if (!hasSearched) {
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
    const { searchQuery } = this.state;
    const { recentSearches, searchResultsMeta: { loading } } = this.props;

    if (loading) {
      return null;
    }

    if (recentSearches.length === 0 && searchQuery.length === 0) {
      return (
        <View style={{
          flex: 1,
          alignSelf: 'center',
          justifyContent: 'center',
          width: '70%',
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
    const { recentSearches, searchResultsMeta: {loading}, searchResults } = this.props;

    if (loading) {
      return null;
    }

    if (searchResults.length > 0) {
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


const mapStateToProps = (state: AppState, ownProps: OwnProps): StateProps => {
  return { 
    isConnected: state.isConnected,
    recentSearches: state.recentSearches,
    searchResults: state.searchResults,
    searchResultsMeta: state.searchResultsMeta,
  }
}

const mapDispatchToProps = (dispatch: any): ActionProps => {
  return {
    performSearch: (api: BaseApi, userId: string, searchQuery: string, page: number) => 
      dispatch(appActions.performSearch(api, userId, searchQuery, page))
  }
} 

export default connect(mapStateToProps, mapDispatchToProps)(SearchScreen);
