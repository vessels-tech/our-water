export type GGMNLocationResponse = {

  count: number,
  next: string,
  previous: string,
  results: Array<GGMNLocation>
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

