import { Reading } from "./OurWater";

export type GGMNLocationResponse = {

  count: number,
  next: string,
  previous: string,
  results: Array<GGMNLocation>
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

export interface GGMNReading extends Reading {
  timeseriesId: string, //The id of the timeseries to save this reading to in GGMN
}