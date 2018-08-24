export type Resource = {
  id: string,
  //TODO: remove this, it no longer applies
  legacyId: string,
  // externalIds: ResourceIdType
  coords: OWGeoPoint
  // resourceType: ResourceType
  // owner: ResourceOwnerType
  groups: Map<string, boolean> | null//simple dict with key of GroupId, value of true

  lastValue: number;
  lastReadingDatetime: Date;
}

export type OWGeoPoint = {
  _latitude: number,
  _longitude: number,
}