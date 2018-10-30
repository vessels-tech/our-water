import { SearchResult } from "./OurWater";
import { GGMNSearchResult } from "./GGMN";

export enum SearchResultType {
  GGMN = 'GGMN',
  Default = 'Default',
}

export type AnySearchResult =  SearchResult;