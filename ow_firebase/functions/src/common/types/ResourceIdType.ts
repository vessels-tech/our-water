export default class ResourceIdType {
  legacyMyWellId: string | null
  legacyMyWellResourceId: string | null
  hasLegacyMyWellResourceId: boolean | null
  //We can add other bits and pieces here

  static none(): ResourceIdType {
    return new ResourceIdType();
  }

  static fromLegacyPincode(pincode: any): ResourceIdType {
    const legacyId = new ResourceIdType();
    legacyId.legacyMyWellId = `${pincode}`;

    return legacyId;
  }

  static fromLegacyVillageId(pincode: number, villageId: number): ResourceIdType {
    const legacyId = new ResourceIdType();
    legacyId.legacyMyWellId = `${pincode}.${villageId}`;

    return legacyId;
  }

  static fromLegacyMyWellId(postcode: number, resourceId: number): ResourceIdType {
    const legacyId = new ResourceIdType();
    legacyId.legacyMyWellId = `${postcode}.${resourceId}`;

    return legacyId
  }

  static fromLegacyReadingId(id: number, postcode:number, resourceId: number): ResourceIdType {
    const legacyId = new ResourceIdType();
    legacyId.legacyMyWellId = `${id}`; //identifies this specific reading
    legacyId.hasLegacyMyWellResourceId = true //identified that the reading is linked to an external datasource
    legacyId.legacyMyWellResourceId = `${postcode}.${resourceId}`; //identifies the reading's resource id

    return legacyId
  }

  public serialize(): any {
    const serialized = {};

    if (this.legacyMyWellId) {
      serialized['legacyMyWellId'] = this.legacyMyWellId;
    }

    if (this.legacyMyWellResourceId) {
      serialized['legacyMyWellResourceId'] = this.legacyMyWellResourceId;
    }

    if (this.hasLegacyMyWellResourceId) {
      serialized['hasLegacyMyWellResourceId'] = true;
    }

    return serialized;
  }

}