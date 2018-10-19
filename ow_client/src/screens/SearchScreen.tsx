import * as React from 'react';
import { Component } from "react";
import {
  View, TouchableNativeFeedback, ScrollView, TouchableHighlight, ToastAndroid,
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
import { SomeResult, ResultType } from '../typings/AppProviderTypes';
import * as appActions from '../actions';
import { GGMNSearchEntity } from '../typings/models/GGMN';
import { TranslationFile } from 'ow_translations/Types';

export interface OwnProps {
  onSearchResultPressed: (result: GGMNSearchEntity) => void,
  navigator: any;
  userId: string,
  config: ConfigFactory,
}

export interface StateProps {
  isConnected: boolean,
  recentSearches: string[],
  searchResults: GGMNSearchEntity[], //This may be more than just resources in the future
  searchResultsMeta: ActionMeta,
  translation: TranslationFile,
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
    const { translation: { templates: { search_heading}}} = this.props;

    return (
      <SearchBar
        lightTheme
        noIcon
        onChangeText={(searchQuery) => this.setState({ searchQuery, hasSearched: false })}
        onEndEditing={() => this.performSearch()}
        value={this.state.searchQuery}
        placeholder={search_heading} />
    );
  }

  /**
   * Perform the search for the given query
   */
  async performSearch() {
    const { searchQuery, page } = this.state;
    const { translation: { templates: { search_error } } } = this.props;

  
    this.setState({hasSearched: true});
    const result = await this.props.performSearch(this.appApi, this.props.userId, searchQuery, page);
       
    if (result.type === ResultType.ERROR) {
      ToastAndroid.showWithGravity(search_error, ToastAndroid.SHORT, ToastAndroid.CENTER);
    }
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
    const { 
      searchResults, 
      searchResultsMeta: { loading }, 
      translation: { templates: { search_more } },
    } = this.props;


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

    if (searchResults.length === 0) {
      return null;
    }

    return (
      <View>
        {
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
                title={r.title}
                avatar={getGroundwaterAvatar()}
                >
              </ListItem>
            );
          })  
        }
        {/* TODO: only display if we have 25 results, 
            we need to pass through the page size in the meta field */}
        <ListItem
          containerStyle={{
            paddingLeft: 10,
          }}
          hideChevron
          key={'load_more'}
          onPress={() => {
            this.loadMore()
          }}
          title={search_more}
        />
      </View>
    );
  }

  getNoResultsFoundText() {
    const { hasSearched } = this.state;
    const { 
      searchResults, 
      searchResultsMeta: { loading },
      translation: { templates: { search_no_results } },
    } = this.props;

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
          {search_no_results}
          </Text>
      </View>
    );
  }

  getSearchHint() {
    const { searchQuery } = this.state;
    const { 
      recentSearches, 
      searchResultsMeta: { loading },
      translation: { templates: { search_hint } },
    } = this.props;

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
          >{search_hint} </Text>
        </View>
      );
    }
  }

  getRecentSearches() {
    const { 
      recentSearches, 
      searchResultsMeta: {loading}, 
      searchResults,
      translation: { templates: { search_recent_searches } },
    } = this.props;

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
        <Card title={search_recent_searches}>
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
    const { isConnected, translation: { templates: { search_offline_line_1, search_offline_line_2 } } } = this.props;

    if (isConnected === true) {
      return null;
    }

    return (
      <View>
        <Text>{search_offline_line_1}</Text>
        <Text>{search_offline_line_2}</Text>
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
    translation: state.translation,
  }
}

const mapDispatchToProps = (dispatch: any): ActionProps => {
  return {
    performSearch: (api: BaseApi, userId: string, searchQuery: string, page: number) => 
      dispatch(appActions.performSearch(api, userId, searchQuery, page))
  }
} 

export default connect(mapStateToProps, mapDispatchToProps)(SearchScreen);
