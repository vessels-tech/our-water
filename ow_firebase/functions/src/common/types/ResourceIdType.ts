export default class ResourceIdType {
  legacyMyWellId: string | null
  //We can add other bits and pieces here


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

  static fromLegacyReadingId(id: number): ResourceIdType {
    const legacyId = new ResourceIdType();
    legacyId.legacyMyWellId = `${id}`;

    return legacyId
  }

  public serialize(): any {
    return {
      legacyMyWellId: this.legacyMyWellId,
    };
  }

}