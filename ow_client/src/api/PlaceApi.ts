import { SomeResult, makeSuccess, makeError, ResultType } from "ow_common/lib/utils/AppProviderTypes";
import { SearchResult, PlaceResult, SearchPageParams, SearchResultType } from "ow_common/lib/api/SearchApi";
import { safeLower } from 'ow_common/lib/utils';
//@ts-ignore
import { default as ftch } from '../utils/Fetch';

//TD: this should probably be in the config api...
import { PlaceApiBaseUrl as baseUrl } from '../utils/EnvConfig';
import { naiveParseFetchResponse } from "../utils";

const timeout = 1000 * 30; //30 seconds


export default class PlaceApi {

  //Taken from OW_Common, but adapted for fetch api.
  //TD: we should put this back in common and generalize the fetch/request interface

  public static async searchForPlaceName(placeName: string, searchParams: SearchPageParams):
    Promise<SomeResult<SearchResult<Array<PlaceResult>>>> {

    const limit = safeLower(searchParams.limit, 20);

    // https://nominatim.openstreetmap.org/search/adelaide?format=json
    //TODO: proper param parsing etc.
    const uri = `${baseUrl}/${placeName}?format=json&email=admin@vesselstech.com&limit=${limit}`;
    const options = {
      timeout,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include' //make sure fetch sets the cookie for us.
    };

    //TODO: make generic enough for both request and fetch
    return ftch(uri, options)
      .then((response: any) => naiveParseFetchResponse<any>(response))
      .then((response: SomeResult<any>) => {
        if (response.type === ResultType.ERROR) {
          return response;
        }

        const rawPlaces = response.result;

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
        const places: PlaceResult[] = rawPlaces
        //filter out irrelevant places
        .filter((r: any) => r.importance > 0.35)
        .map((r: any) => ({
          type: SearchResultType.PlaceResult,
          name: r.display_name,
          coords: { latitude: parseFloat(r.lat), longitude: parseFloat(r.lon) },
          boundingBox: r.boundingbox.map((point: string) => parseFloat(point)),
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

}