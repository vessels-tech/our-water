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
import { SearchResult as SearchResultV1} from '../typings/models/OurWater';
import BaseApi from '../api/BaseApi';
import Loading from '../components/common/Loading';
import { ConfigFactory } from '../config/ConfigFactory';
import { getGroundwaterAvatar, dedupArray, getPlaceAvatar, formatShortId, formatShortIdOrElse, getShortIdOrFallback } from '../utils';
import { AppState, CacheType } from '../reducers';
import { connect } from 'react-redux';
import { SearchResultsMeta } from '../typings/Reducer';
import { SomeResult, ResultType } from '../typings/AppProviderTypes';
import * as appActions from '../actions';
import { TranslationFile, TranslationEnum } from 'ow_translations';
import { AnyResource } from '../typings/models/Resource';
import { OrgType } from '../typings/models/OrgType';
import { SearchResult, PartialResourceResult, PlaceResult, SearchResultType } from 'ow_common/lib/api/SearchApi';
import { isDefined, isUndefined, getOrElse, safeGetNested, safeGetNestedDefault } from 'ow_common/lib/utils';
import { statusBarTextColorScheme } from '../assets/mywell/NewColors';

import withPreventDoubleClick from '../components/common/withPreventDoubleClick';
import { Navigation } from 'react-native-navigation';
import { NavigationStacks } from '../enums';
const ListItemEx = withPreventDoubleClick(ListItem);

export interface OwnProps {
  onSearchResultPressedV1: (result: AnyResource) => void,
  onSearchResultPressed: (result: PartialResourceResult | PlaceResult) => void,
  userId: string,
  config: ConfigFactory,
}

export interface StateProps {
  isConnected: boolean,
  recentSearches: string[],
  searchResultsV1: SearchResultV1, //This may be more than just resources in the future
  searchResults: Array<SearchResult<Array<PartialResourceResult | PlaceResult>>>,
  searchResultsMeta: SearchResultsMeta,
  translation: TranslationFile,
  shortIdCache: CacheType<string>, //resourceId => shortId
}

export interface ActionProps {
  performSearch: (api: BaseApi, userId: string, searchQuery: string, page: number, v1: boolean) => SomeResult<void>
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
    const result = await this.props.performSearch(this.appApi, this.props.userId, searchQuery, pageOverride || this.state.page, this.props.config.getShouldUseV1Search());

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

  onSearchResultPressedV1(r: AnyResource){
    Navigation.pop(NavigationStacks.Root)
    this.props.onSearchResultPressedV1(r)
  }

  onSearchResultPressed(r: PartialResourceResult | PlaceResult){
    Navigation.pop(NavigationStacks.Root)
    this.props.onSearchResultPressed(r)
  }

  onRecentSearchPressed(r: string){
    this.setState({ searchQuery: r }, () => { this.performSearch() });
  }

  /**
   * Display the search results, in a series of cards and grids
   * similar to google maps.
   */
  getSearchResultsV1() {
    const {
      searchResultsV1,
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

    if (searchResultsV1.resources.length === 0) {
      return null;
    }

    return (
      <View>
        {
          searchResultsV1.resources.map((r: AnyResource, i) => {
            return (
              <ListItemEx
                containerStyle={{
                  paddingLeft: 10,
                }}
                hideChevron={true}
                key={i}
                onPress={this.onSearchResultPressedV1.bind(this, r)}
                roundAvatar={true}
                title={r.type === OrgType.GGMN ? r.title : r.id}
                avatar={getGroundwaterAvatar()}
              />
            );
          })
        }
        {/* TODO: only display if we have 25 results,
            we need to pass through the page size in the meta field */}
        {searchResultsV1.hasNextPage ?
          <ListItemEx
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

  /**
   * getSearchResults
   *
   * Display the search results, divided by category
   * Currently only resource and place
   */
  getSearchResults() {
    const {
      searchResults,
      searchResultsMeta: { loading },
    } = this.props;
    const { formatSubtitlekey } = this.props.translation.templates;
    const { page } = this.state;

    if (loading) {
      return (
        <View style={{
          justifyContent: 'center',
          height: 350,
        }}>
          <Loading />
        </View>
      );
    }

    //Rearrange search results and deduplicate
    const partialResourceResults = mapAndDedupSearchResults<PartialResourceResult>(searchResults, SearchResultType.PartialResourceResult, (r) => r.id);
    const placeResults = mapAndDedupSearchResults<PlaceResult>(searchResults, SearchResultType.PlaceResult, (r) => r.name);

    return (
      <View>
        {partialResourceResults
        .map(r => {
          const shortIdFromCache = () => getShortIdOrFallback(r.id, this.props.shortIdCache, r.id);
          const shortIdFormatted = formatShortIdOrElse(getOrElse(r.shortId, shortIdFromCache()), shortIdFromCache());
          const ownerName = safeGetNestedDefault(r, ['owner', 'name'], '');

          const title = `${shortIdFormatted} - ${ownerName}`;
          let subtitle = '';

          if (r.groups) {
            const actualGroups: CacheType<string> = getOrElse(r.groups, {});
            subtitle = Object.keys(actualGroups).reduce((acc: string, curr: string, idx) => {
              const value = actualGroups[curr];
              let sep = ' | ';
              if (idx === Object.keys(actualGroups).length - 1) {
                sep = "";
              }
              return acc + `${formatSubtitlekey(curr)}:${value}${sep}`;
            }, "");
          };

          return (
            <ListItemEx
              containerStyle={{
                paddingLeft: 10,
              }}
              hideChevron={true}
              key={r.id}
              onPress={this.onSearchResultPressed.bind(this, r)}
              roundAvatar={true}
              title={title}
              subtitle={subtitle}
              avatar={getGroundwaterAvatar()}
            />
        )})}
        {placeResults.map(r => (
          <ListItemEx
            containerStyle={{
              paddingLeft: 10,
            }}
            hideChevron={true}
            key={r.name}
            onPress={this.onSearchResultPressed.bind(this, r)}
            roundAvatar={true}
            title={r.name}
            avatar={getPlaceAvatar()}
          />
        ))}
      </View>
    );
  }

  getNoResultsFoundText() {
    const { hasSearched } = this.state;
    const {
      searchResultsV1,
      searchResults,
      searchResultsMeta: { loading },
      translation: { templates: { search_no_results } },
    } = this.props;

    if (loading) {
      return null;
    }

    if (searchResultsV1.resources.length > 0) {
      return null;
    }

    if (getInnerSearchResultCount(searchResults) > 0) {
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
      searchResultsV1,
      searchResultsMeta: { loading },
      translation: { templates: { search_hint } },
    } = this.props;

    if (loading) {
      return null;
    }

    //TODO: SearchResults is somehow undefined here

    if (recentSearches.length === 0 && searchQuery.length === 0 && searchResultsV1.resources.length === 0) {
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
      searchResultsV1,
      searchResults,
      translation: { templates: { search_recent_searches } },
    } = this.props;

    if (loading) {
      return null;
    }

    if (searchResultsV1.resources.length > 0) {
      return null;
    }

    //TODO: this won't work, we need to look at each of the arrays in the searchResults
    if (getInnerSearchResultCount(searchResults) > 0) {
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
                <ListItemEx
                  containerStyle={{
                    paddingLeft: 0,
                    marginLeft: 0,
                  }}
                  hideChevron={true}
                  key={i}
                  component={TouchableNativeFeedback}
                  onPress={this.onRecentSearchPressed.bind(this, r)}
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
          {this.props.config.getShouldUseV1Search() ? this.getSearchResultsV1() : this.getSearchResults()}
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
    searchResultsV1: state.searchResultsV1,
    searchResults: state.searchResults,
    searchResultsMeta: state.searchResultsMeta,
    translation: state.translation,
    shortIdCache: state.shortIdCache,
  }
}

const mapDispatchToProps = (dispatch: any): ActionProps => {
  return {
    performSearch: (api: BaseApi, userId: string, searchQuery: string, page: number, v1: boolean) =>
      dispatch(appActions.performSearch(api, userId, searchQuery, page, v1))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(SearchScreen);



/**
 * Given search results, map and deduplicate by category
 */
function mapAndDedupSearchResults<T>(
  results: Array<SearchResult<Array<PartialResourceResult | PlaceResult>>>,
  type: SearchResultType,
  dedupFunction: (item: T) => string): Array<T>
{
  const resultsDup: Array<T> = results
    .filter(sr => sr.type === type)
    .reduce((acc: Array<T>, curr) => {
      curr.results.forEach(r => {
        //TODO: Add types here
        if (r.type === type) {
          acc.push(r);
        }
      });

      return acc;
    }, []);

  return dedupArray(resultsDup, dedupFunction);
}

function getInnerSearchResultCount(searchResults: SearchResult<(PartialResourceResult | PlaceResult)[]>[]): number {
  let count = 0;
  searchResults.forEach(r => {
    r.results.forEach(() => count += 1);
  });
  return count;
}
