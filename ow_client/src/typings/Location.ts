export enum LocationType {
  LOCATION = 'LOCATION',
  NO_LOCATION = 'NO_LOCATION'
}

export interface Location {
  type: LocationType.LOCATION,
  coords: {
    latitude: number,
    longitude: number,
  }
}

export interface NoLocation {
  type: LocationType.NO_LOCATION,
}


