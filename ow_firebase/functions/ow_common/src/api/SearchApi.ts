import { SomeResult, makeError, makeSuccess, ResultType } from "../utils/AppProviderTypes";
import { leftPad, rightPad }  from '../utils/StringUtils';
import * as admin from "firebase-admin";
import { CollectionReference, DocumentSnapshot, QuerySnapshot, QueryDocumentSnapshot } from "@google-cloud/firestore";
import { safeLower } from "../utils/Utils";
import { DictType } from "../utils/DictType";
import { Maybe } from "../utils/Maybe";

type Firestore = admin.firestore.Firestore;


export type SearchPageParams = {
  lastVisible?: DocumentSnapshot,
  limit: number,
}

export enum SearchResultType {
  PartialResourceResult = "PartialResourceResult",
  PlaceResult = "PlaceResult",
}

export type SearchResult<T> = {
  results: T,
  params: SearchPageParams,
  type: SearchResultType
};

export type PartialResourceResult = {
  type: SearchResultType.PartialResourceResult,
  id: string,
  shortId: Maybe<string>,
  groups: DictType<string>,
  owner: DictType<string>,
}

export type PlaceResult = {
  type: SearchResultType.PlaceResult,
  name: string,
  coords: { latitude: number, longitude: number},
  boundingBox: number[],
}

export class SearchApi {
  private firestore: Firestore;
  private orgId: string;


  constructor(firestore: Firestore, orgId: string) {
    this.firestore = firestore;
    this.orgId = orgId;
  }

  /**
   * searchByLocationName
   * 
   */
  async searchByLocationName(searchQuery: string, searchParams: SearchPageParams):
    Promise<SomeResult<SearchResult<Array<PartialResourceResult>>>> {
    console.log('searchByOwnerName')

    //Build base query
    //For some reason has to be any
    let query: any = SearchApi.resourceCol(this.firestore, this.orgId)
    .where(`locationName`, '>=', searchQuery)
    .where(`locationName`, '<=', `${searchQuery}z`) //append a z to take advantage of string sort
    //The nodejs api allows us to order by Id, but RN Firebase doesn't
    .orderBy(`locationName`)

    if (searchParams.lastVisible) {
      query = query.startAfter(searchParams.lastVisible);
    }
    query = query.limit(safeLower(searchParams.limit, 100));

    //Run the query
    let lastVisible: QueryDocumentSnapshot;
    return await query.get()
    .then((sn: QuerySnapshot) => {
      const queryResults: PartialResourceResult[] = [];
      lastVisible = sn.docs[sn.docs.length - 1];

      sn.forEach(doc => {
        const data = doc.data();
        if (data._id) {
          return;
        }
        const result: PartialResourceResult = {
          type: SearchResultType.PartialResourceResult,
          id: data.id,
          shortId: undefined,
          groups: data.groups,
          owner: data.owner,
        };
        queryResults.push(result);
      });

      return queryResults;
    })
    .then((results: any) => {
      const searchResult: SearchResult<Array<PartialResourceResult>> = {
        params: {
          ...searchParams,
          lastVisible,
        },
        results,
        type: SearchResultType.PartialResourceResult,
      };
      return makeSuccess<SearchResult<Array<PartialResourceResult>>>(searchResult);
    })
    .catch((err: Error) => makeError<SearchResult<Array<PartialResourceResult>>>(err.message));
  }

  /**
   * searchByOwnerName
   * 
   */
  async searchByOwnerName(searchQuery: string, searchParams: SearchPageParams):
    Promise<SomeResult<SearchResult<Array<PartialResourceResult>>>> {
    console.log('searchByOwnerName')

    //Build base query
    //For some reason has to be any
    let query: any = SearchApi.resourceCol(this.firestore, this.orgId)
    .where(`owner.name`, '>=', searchQuery)
    .where(`owner.name`, '<=', `${searchQuery}z`) //append a z to take advantage of string sort
    //The nodejs api allows us to order by Id, but RN Firebase doesn't
    .orderBy(`owner.name`)

    if (searchParams.lastVisible) {
      query = query.startAfter(searchParams.lastVisible);
    }
    query = query.limit(safeLower(searchParams.limit, 100));

    //Run the query
    let lastVisible: QueryDocumentSnapshot;
    return await query.get()
    .then((sn: QuerySnapshot) => {
      const queryResults: PartialResourceResult[] = [];
      lastVisible = sn.docs[sn.docs.length - 1];

      sn.forEach(doc => {
        const data = doc.data();
        if (data._id) {
          return;
        }
        const result: PartialResourceResult = {
          type: SearchResultType.PartialResourceResult,
          id: data.id,
          shortId: undefined,
          groups: data.groups,
          owner: data.owner,
        };
        queryResults.push(result);
      });

      return queryResults;
    })
    .then((results: any) => {
      const searchResult: SearchResult<Array<PartialResourceResult>> = {
        params: {
          ...searchParams,
          lastVisible,
        },
        results,
        type: SearchResultType.PartialResourceResult,
      };
      return makeSuccess<SearchResult<Array<PartialResourceResult>>>(searchResult);
    })
    .catch((err: Error) => makeError<SearchResult<Array<PartialResourceResult>>>(err.message));
  }

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
  public async searchForPlaceName(baseUrl: string, placeName: string, searchParams: SearchPageParams, requestApi: any):
  Promise<SomeResult<SearchResult<Array<PlaceResult>>>> {

    const limit = safeLower(searchParams.limit, 20);

    // https://nominatim.openstreetmap.org/search/adelaide?format=json
    //TODO: proper param parsing etc.
    const uri = `${baseUrl}/${placeName}?format=json&email=admin@vesselstech.com&limit=${limit}`;
    const options = {
      method: "GET",
      uri,
      json: true,
    };
    //TODO: make generic enough for both request and fetch
    return requestApi(options)
    .then((response: any) => {

      /*
        example response: {
          place_id: '6878179',
          licence: 'Data © OpenStreetMap contributors, ODbL 1.0. https://osm.org/copyright',
          osm_type: 'node',
          osm_id: '703221878',
          boundingbox: [ '3.9126024', '3.9326024', '-75.1533441', '-75.1333441' ],
          lat: '3.9226024',
          lon: '-75.1433441',
          display_name: 'Adelaide, Ortega, Tolima, Colombia',
        }
      */

      const places: PlaceResult[] = response.map((r: any) => ({
        type: SearchResultType.PlaceResult,
        name: r.display_name,
        coords: { latitude: parseFloat(r.lat), longitude: parseFloat(r.lon) },
        boundingBox: r.boundingbox.map((point: string) => parseFloat(point) ),
      }))
      .filter((p: PlaceResult) => p.name !== null);

      return makeSuccess<SearchResult<Array<PlaceResult>>>({
        params: searchParams,
        results: places,
        type: SearchResultType.PlaceResult,
      });
    })
    .catch((err: Error) => makeError<SearchResult<Array<PlaceResult>>>(err.message));
   }

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
  public async searchForResourceInGroup(groupQuery: string, groupToSearch: string, searchParams: SearchPageParams):
  Promise<SomeResult<SearchResult<Array<PartialResourceResult>>>> {

    //Build base query
    //For some reason has to be any
    let query: any = SearchApi.resourceCol(this.firestore, this.orgId)
    .where(`groups.${groupToSearch}`, '>=', groupQuery)
    .where(`groups.${groupToSearch}`, '<=', `${groupQuery}z`) //append a z to take advantage of string sort
    //The nodejs api allows us to order by Id, but RN Firebase doesn't
    .orderBy(`groups.${groupToSearch}`)

    if (searchParams.lastVisible) {
      query = query.startAfter(searchParams.lastVisible);
    }
    query = query.limit(safeLower(searchParams.limit, 100));

    //Run the query
    let lastVisible: QueryDocumentSnapshot;
    return await query.get()
    .then((sn: QuerySnapshot) => {
      const queryResults: PartialResourceResult[] = [];
      lastVisible = sn.docs[sn.docs.length - 1];

      sn.forEach(doc => {
        const data = doc.data();
        if (data._id) {
          return;
        }
        const result: PartialResourceResult = {
          type: SearchResultType.PartialResourceResult,
          id: data.id,
          shortId: undefined,
          groups: data.groups,
          owner: data.owner,
        };
        queryResults.push(result);
      });

      return queryResults;
    })
    .then((results: any) => {
      const searchResult: SearchResult<Array<PartialResourceResult>> = {
        params: {
          ...searchParams,
          lastVisible,
        },
        results,
        type: SearchResultType.PartialResourceResult,
      };
      return makeSuccess<SearchResult<Array<PartialResourceResult>>>(searchResult);
    })
    .catch((err: Error) => makeError<SearchResult<Array<PartialResourceResult>>>(err.message));
  }

  /**
   * searchByShortId
   * 
   * Search for a resource given a shortId or shortId fragment
   * 
   * @param shortIdQuery: string - a 6 digit or 9 digit shortId, or shortId fragment
   * @param searchParams: SearchPageParams - params for pagination and limiting etc.
   * @returns Promise<SomeResult<SearchResult>> - PartialResourceResult
   */
  public async searchByShortId(shortIdQuery: string, searchParams: SearchPageParams): 
  Promise<SomeResult<SearchResult<Array<PartialResourceResult>>>> {

    const searchRangeResult = SearchApi.rangeFromShortIdString(shortIdQuery);
    if (searchRangeResult.type === ResultType.ERROR) {
      return Promise.resolve(searchRangeResult);
    }
    const [lowerRange, upperRange] = searchRangeResult.result;

    //Build base query
    //For some reason has to be any
    let query: any = SearchApi.shortIdCol(this.firestore, this.orgId);
    
    if (lowerRange !== upperRange) {
      query = query.where('id', '>=', lowerRange).where('id', '<', upperRange);
    } else {
      //Ideally we could do an '=', but RNF doesn't like that
      query = query.where('id', '>=', lowerRange).where('id', '<=', upperRange);
    }

    query = query.orderBy('id');
    if (searchParams.lastVisible) {
      query = query.startAfter(searchParams.lastVisible);
    }

    //Max limit is 100
    query = query.limit(safeLower(searchParams.limit, 100));

    //Run the query
    let lastVisible: QueryDocumentSnapshot;
    return await query.get()
    .then((sn: QuerySnapshot) => {  
      const queryResults: PartialResourceResult[] = [];
      lastVisible = sn.docs[sn.docs.length - 1];

      sn.forEach(doc => {
        const data = doc.data();
        if (data._id) {
          return;
        }
        const result: PartialResourceResult = {
          type: SearchResultType.PartialResourceResult,
          id: data.longId,
          shortId: data.shortId,
          groups: {},
          owner: {}
        };
        queryResults.push(result);
      });

      return queryResults;
    })
    .then((results: any) => {
      const searchResult: SearchResult<Array<PartialResourceResult>> = {
        params: {
          ...searchParams,
          lastVisible,
        },
        results,
        type: SearchResultType.PartialResourceResult,
      };
      return makeSuccess<SearchResult<Array<PartialResourceResult>>>(searchResult);
    })
    .catch((err: Error) => makeError<SearchResult<Array<PartialResourceResult>>>(err.message));
  }


  //
  // Helpers
  // ------------------------------------

  public static shortIdCol(firestore: Firestore, orgId: string): CollectionReference {
    return firestore.collection('org').doc(orgId).collection('shortId');
  }

  public static resourceCol(firestore: Firestore, orgId: string): CollectionReference {
    return firestore.collection('org').doc(orgId).collection('resource');
  }


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
  public static rangeFromShortIdString(shortId: string): SomeResult<[string, string]> {
    let lowerRange: string = "";
    let upperRange: string = "";

    //Strip out all spaces, dashes, etc
    // let base = shortId.replace(new RegExp(/[^\d]+/, 'g'), '');
    let base = shortId.replace(/[^\d]+/ig, '');

    //Make sure it's within the range
    if (base.length === 0 || base.length > 9) {
      return makeError<[string, string]>("search short id is too long or short");
    }

    //If it's shorter than 6 digits, long, assume we have an extra three 000s at
    //the start. This may break things later on, but only when we have 530,000+ ids
    if (base.length <= 6) {
      base = "000" + base;
    }

    //If we are using a fullId, then just return that id twice
    if (base.length === 9) {
      return makeSuccess<[string, string]>([base, base]);
    }

    //We have a partial short id.
    //This means we need to convert it into a number and add one, then convert
    //back and add any left zeros we may have removed.
    lowerRange = base;
    let lowerNumber
    let upperNumber;
    try {
      lowerNumber = parseInt(lowerRange);
      if (lowerNumber === NaN) {
        throw new Error(`Error parsing shortId base string: ${lowerNumber}`);
      }
      upperNumber = lowerNumber + 1;
      upperRange = upperNumber.toString();
    } catch (err) {
      return makeError<[string, string]>(err.message);
    }

    if (!upperNumber) {
      return makeError<[string, string]>(`Error parsing shortId base string and adding 1: ${lowerNumber}`);
    }

    //Pad the left side of the string to get the leading 00's back
    upperRange = leftPad(upperRange, '0', lowerRange.length);

    //Pad the right hand side to make a 9 digit number
    lowerRange = rightPad(lowerRange, '0', 9);
    upperRange = rightPad(upperRange, '0', 9);


    return makeSuccess<[string, string]>([lowerRange, upperRange]);
  }
}