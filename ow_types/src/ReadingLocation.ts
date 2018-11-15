import { OWGeoPoint } from "./OurWater";

export type MaybeReadingLocation = ReadingLocation | NoReadingLocation;

export enum ReadingLocationType {
  NONE = 'NONE',
  LOCATION = 'LOCATION',
}

export type ReadingLocation = {
  type: ReadingLocationType.LOCATION,
  location: OWGeoPoint,
}

export type NoReadingLocation = {
  type: ReadingLocationType.NONE,
}