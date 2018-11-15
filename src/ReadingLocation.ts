import { GeoPoint } from "./GeoPoint";

export type MaybeReadingLocation = ReadingLocation | NoReadingLocation;

export enum ReadingLocationType {
  NONE = 'NONE',
  LOCATION = 'LOCATION',
}

export type ReadingLocation = {
  type: ReadingLocationType.LOCATION,
  location: GeoPoint,
}

export type NoReadingLocation = {
  type: ReadingLocationType.NONE,
}