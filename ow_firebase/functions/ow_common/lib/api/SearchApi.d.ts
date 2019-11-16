import { SomeResult } from "../utils/AppProviderTypes";
import * as admin from "firebase-admin";
import { CollectionReference, DocumentSnapshot } from "@google-cloud/firestore";
import { DictType } from "../utils/DictType";
import { Maybe } from "../utils/Maybe";
declare type Firestore = admin.firestore.Firestore;
export declare type SearchPageParams = {
    lastVisible?: DocumentSnapshot;
    limit: number;
};
export declare enum SearchResultType {
    PartialResourceResult = "PartialResourceResult",
    PlaceResult = "PlaceResult"
}
export declare type SearchResult<T> = {
    results: T;
    params: SearchPageParams;
    type: SearchResultType;
};
export declare type PartialResourceResult = {
    type: SearchResultType.PartialResourceResult;
    id: string;
    shortId: Maybe<string>;
    groups: DictType<string>;
    owner: DictType<string>;
};
export declare type PlaceResult = {
    type: SearchResultType.PlaceResult;
    name: string;
    coords: {
        latitude: number;
        longitude: number;
    };
    boundingBox: number[];
};
export declare class SearchApi {
    private firestore;
    private orgId;
    constructor(firestore: Firestore, orgId: string);
    /**
     * searchByLocationName
     *
     */
    searchByLocationName(searchQuery: string, searchParams: SearchPageParams): Promise<SomeResult<SearchResult<Array<PartialResourceResult>>>>;
    /**
     * searchByOwnerName
     *
     */
    searchByOwnerName(searchQuery: string, searchParams: SearchPageParams): Promise<SomeResult<SearchResult<Array<PartialResourceResult>>>>;
    /**
     * searchForPlaceName
     *
     * Lookup a place based on a place name. Uses the free nominatim api.
     * In the future, we could extend this by adding our own places, such as villages
     *
     * eg: https://nominatim.openstreetmap.org/search/adelaide?format=json
     *
     * @param baseUrl: string
     * @param placeName: string - the place we are searching for
     * @param searchParams: SearchPageParams - params for pagination and limiting etc. Default limit is 20
     */
    searchForPlaceName(baseUrl: string, placeName: string, searchParams: SearchPageParams, requestApi: any): Promise<SomeResult<SearchResult<Array<PlaceResult>>>>;
    /**
     * searchForResourceInGroup
     *
     * Search for resource given based on group membership. Sorts using where filters on
     * the field, taking advantage of lexicographic sorting. We need a better approach,
     * but firebase doesn't allow it atm.
     *
     * @param groupQuery: string
     * @param groupToSearch: string - the group we are searching for
     * @param searchParams: SearchPageParams - params for pagination and limiting etc.
     */
    searchForResourceInGroup(groupQuery: string, groupToSearch: string, searchParams: SearchPageParams): Promise<SomeResult<SearchResult<Array<PartialResourceResult>>>>;
    /**
     * searchByShortId
     *
     * Search for a resource given a shortId or shortId fragment
     *
     * @param shortIdQuery: string - a 6 digit or 9 digit shortId, or shortId fragment
     * @param searchParams: SearchPageParams - params for pagination and limiting etc.
     * @returns Promise<SomeResult<SearchResult>> - PartialResourceResult
     */
    searchByShortId(shortIdQuery: string, searchParams: SearchPageParams): Promise<SomeResult<SearchResult<Array<PartialResourceResult>>>>;
    static shortIdCol(firestore: Firestore, orgId: string): CollectionReference;
    static resourceCol(firestore: Firestore, orgId: string): CollectionReference;
    /**
     * rangeFromShortIdString
     *
     *
     * Transform the shortId or shortId partial into a searchable string. For example:
     *
     *   100-000  -> 000100000, 000100000 | exactly id 000-100-000
     *   100      -> 000100000, 000101000 | any shortId starting with 000-100
     *   1001     -> 000100100, 000100200 | Any short id between 000-100-100 and 000-100-200
     *   00010001 -> 000100010, 000100020 | Any short id between 000-100-010 and 000-100-020
     *
     *
     * @param shortId: shortId string or partial string
     * @returns SomeResult<[string, string]>: the range of strings to search for.
     */
    static rangeFromShortIdString(shortId: string): SomeResult<[string, string]>;
}
export {};
