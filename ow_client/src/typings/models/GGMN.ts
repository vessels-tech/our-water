import { Reading } from "./OurWater";
import { SearchResultType } from "./Generics";

export type GGMNLocationResponse = {
  count: number,
  next: string,
  previous: string,
  results: Array<GGMNLocation>
}

export type GGMNTimeseriesResponse = {
  count: number,
  next: string,
  previous: string,
  results: Array<GGMNTimeseries>
}

export type GGMNSearchResponse = {
  count: number,
  next: string,
  previous: string,
  results: GGMNSearchEntity[],
}

export type GGMNSearchEntity = {
  id: string, 
  title: string,
  entity_name: string,
  entity_id: string,
}

/**
 * The OW-Compatible Search result
 * must contain the type field
 */
export type GGMNSearchResult = {
  type: SearchResultType.GGMN,
  results: GGMNSearchEntity[],
}

export type GGMNGroundwaterStationResponse = {
  count: number,
  next: string,
  previous: string,
  results: Array<GGMNGroundwaterStation>
}

export type GGMNSaveReadingResponse = GGMNReadingData[];

export type GGMNReadingData = {
  datetime: string,
  value: string, //According to what comes back, it is a string. But this feels wrong
};

export type GGMNGroundwaterStation = {
  id: number,
  code: string,
  geometry: GGMNGeometry,
  name: string,
  filters: Array<GGMNFilterResponse>,
}

export type GGMNFilterResponse = {
  timeseries: Array<GGMNTimeseries>,
}

export type GGMNTimeseries = {
  uuid: string,
  name: string,
  parameter: string,
  unit: string,
  reference_frame: string,
  scale: string,
  value_type: string,
  location: string,
  last_value: number,
  events: Array<GGMNTimeseriesEvent>,
}


export type GGMNTimeseriesEvent = {
  timestamp: number, //unix timestamp
  value: number,
}

export type GGMNLocation = {
  url: string,
  id: number,
  geometry: GGMNGeometry, 
  organisation: GGMNOrganisation,
}

export type GGMNGeometry = {
  type: string, //could be an enum
  coordinates: number[],
}

export type GGMNOrganisation = {
  name: string,
  unique_id: string,
}

export type GGMNOrganisationResponse = {
  count: number,
  next: string,
  prevous: string | null,
  //TODO: there might be a bug here.
  results: GGMNOrganisation[], 
}

export type KeychainLoginDetails = {
  username: string,
  externalOrg: GGMNOrganisation
}