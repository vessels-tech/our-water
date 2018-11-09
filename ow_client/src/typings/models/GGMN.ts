import { Reading } from "./OurWater";

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
  results: Array<GGMNResponseTimeseries>
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
  description: string,
  entity_name: string,
  entity_id: string,
}

export type GGMNUsersResponse = {
  count: number,
  next: string,
  previous: string,
  results: GGMNUser[],
}

export type GGMNUser = {
  url: string,
  username: string,
  first_name: string,
  last_name: string,
  email: string,
  organisations_url: string,
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
  timeseries: Array<GGMNResponseTimeseries>,
}

//TODO: find better name!
export type GGMNResponseTimeseries = {
  uuid: string,
  name: string,
  code: string,
  parameter: string,
  unit: string,
  reference_frame: string,
  scale: string,
  value_type: string,
  location: {
    name: string,
    geometry: {
      coordinates: number[],
    }
  },
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