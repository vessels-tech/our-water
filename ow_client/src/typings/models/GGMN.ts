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
  results: Array<GGMNTimeseries>
}

export type GGMNGroundwaterStationResponse = {
  count: number,
  next: string,
  previous: string,
  results: Array<GGMNGroundwaterStation>
}

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
  last_value?: number,
  events?: Array<GGMNTimeseriesEvent>,
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
  results: any[], //we don't really care about this for now.
}
