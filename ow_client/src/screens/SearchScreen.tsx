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
import { SearchResult } from '../typings/models/OurWater';
import BaseApi from '../api/BaseApi';
import Loading from '../components/common/Loading';
import { ConfigFactory } from '../config/ConfigFactory';
import { getGroundwaterAvatar } from '../utils';
import { AppState } from '../reducers';
import { connect } from 'react-redux';
import { SearchResultsMeta } from '../typings/Reducer';
import { SomeResult, ResultType } from '../typings/AppProviderTypes';
import * as appActions from '../actions';
import { TranslationFile, TranslationEnum } from 'ow_translations';
import { AnyResource } from '../typings/models/Resource';
import { OrgType } from '../typings/models/OrgType';

export interface OwnProps {
  onSearchResultPressed: (result: AnyResource) => void,
  navigator: any;
  userId: string,
  config: ConfigFactory,
}

export interface StateProps {
  isConnected: boolean,
  recentSearches: string[],
  searchResults: SearchResult, //This may be more than just resources in the future
  searchResultsMeta: SearchResultsMeta,
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
      searchQuery: props.searchResultsMeta.searchQuery,
      hasSearched: false,
      page: 1,
    };

    //Binds
    this.loadMore = this.loadMore.bind(this);
    this.searchFirstPage = this.searchFirstPage.bind(this);
    this.performSearch = this.performSearch.bind(this);
    this.onChangeText = this.onChangeText.bind(this);
  }

  getSearchBar() {
    const { translation: { templates: { search_heading}}} = this.props;

    return (
      <SearchBar
        lightTheme={true}
        noIcon={true}
        onChangeText={this.onChangeText}
        onEndEditing={this.searchFirstPage}
        value={this.state.searchQuery}
        placeholder={search_heading} />
    );
  }

  /**
   * Perform the search for the given query
   */
  async performSearch(pageOverride?: number) {
    const { searchQuery } = this.state;
    const { translation: { templates: { search_error } } } = this.props;

    if (searchQuery === '') {
      return;
    }

    if (pageOverride) {
      this.setState({page: pageOverride});
    }
    this.setState({hasSearched: true});
    const result = await this.props.performSearch(this.appApi, this.props.userId, searchQuery, pageOverride || this.state.page);
       
    if (result.type === ResultType.ERROR) {
      ToastAndroid.showWithGravity(search_error, ToastAndroid.SHORT, ToastAndroid.CENTER);
    }
  }

  onChangeText(searchQuery: string) {
    this.setState({ searchQuery, hasSearched: false });
  }

  searchFirstPage() { 
    this.performSearch(1);
  }

  loadMore() {
    const { page } = this.state;
    this.setState({page: page + 1}, 
      () => this.performSearch()
    );
  }

  onSearchResultPressed = (r: AnyResource) => {
    this.props.navigator.pop();
    this.props.onSearchResultPressed(r)
  }

  onRecentSearchPressed = (r: string) => {
    this.setState({ searchQuery: r }, () => { this.performSearch() });
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
    const { page } = this.state;


    if (loading && page === 1) {
      return (
        <View style={{
          justifyContent: 'center',
          height: 350,
        }}>
          <Loading/>
        </View>
      );
    }

    if (searchResults.resources.length === 0) {
      return null;
    }

    return (
      <View>
        {
          searchResults.resources.map((r: AnyResource, i) => {
            return (
              <ListItem
                containerStyle={{
                  paddingLeft: 10,
                }}
                hideChevron={true}
                key={i}
                onPress={this.onSearchResultPressed(r)}
                roundAvatar={true}
                title={r.type === OrgType.GGMN ? r.title : r.id}
                avatar={getGroundwaterAvatar()}
              />
            );
          })  
        }
        {/* TODO: only display if we have 25 results, 
            we need to pass through the page size in the meta field */}
        {searchResults.hasNextPage ?
          <ListItem
            containerStyle={{
              paddingLeft: 10,
            }}
            hideChevron={true}
            key={'load_more'}
            onPress={this.loadMore}
            title={loading? '' : search_more}
            avatar={loading ? <Loading/> : undefined}
          /> : null
        }
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

    if (searchResults.resources.length > 0) {
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
      searchResults,
      searchResultsMeta: { loading },
      translation: { templates: { search_hint } },
    } = this.props;

    if (loading) {
      return null;
    }

    //TODO: SearchResults is somehow undefined here

    if (recentSearches.length === 0 && searchQuery.length === 0 && searchResults.resources.length === 0) {
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

    if (searchResults.resources.length > 0) {
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
                  hideChevron={true}
                  key={i}
                  component={TouchableNativeFeedback}
                  onPress={this.onRecentSearchPressed(r)}
                  roundAvatar={true}
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
