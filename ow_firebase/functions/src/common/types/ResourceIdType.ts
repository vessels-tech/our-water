import { isNullOrUndefined } from "util";

export default class ResourceIdType {
  legacyMyWellId?: string
  hasLegacyMyWellId?: boolean

  legacyMyWellResourceId?: string
  hasLegacyMyWellResourceId?: boolean
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
    legacyId.hasLegacyMyWellId = true;

    return legacyId
  }

  static fromLegacyReadingId(id: number, postcode:number, resourceId: number): ResourceIdType {
    const legacyId = new ResourceIdType();
    legacyId.legacyMyWellId = `${id}`; //identifies this specific reading
    legacyId.hasLegacyMyWellResourceId = true //identified that the reading is linked to an external datasource
    legacyId.legacyMyWellResourceId = `${postcode}.${resourceId}`; //identifies the reading's resource id

    return legacyId
  }

   /**
   * Parse the legacyMyWellResourceId, get the resourceId
   * throws if there is no legacyMyWellResourceId
   */
  public getResourceId() {
    if (isNullOrUndefined(this.legacyMyWellResourceId)) {
      throw new Error('tried to getResourceId, but could not find legacyMyWellResourceId.');
    }

    return parseInt(this.legacyMyWellResourceId.split('.')[1]);
  }

  /**
   * Parse the legacyMyWellResourceId, get the villageId
   * throws if there is no legacyMyWellResourceId
   */
  public getVillageId() {
    if (isNullOrUndefined(this.legacyMyWellResourceId)) {
      throw new Error('tried to getVillageId, but could not find legacyMyWellResourceId.');
    }

    return parseInt(this.legacyMyWellResourceId.split('.')[1].substring(0,2));
  }
  
  /**
   * Parse the legacyMyWellResourceId, get postcode
   */
  public getPostcode() {
    if (isNullOrUndefined(this.legacyMyWellResourceId)) {
      throw new Error('tried to getPostcode, but could not find legacyMyWellResourceId.');
    }

    return parseInt(this.legacyMyWellResourceId.split('.')[0]);
  }

  public serialize(): any {
    const serialized = {};

    if (this.legacyMyWellId) {
      serialized['legacyMyWellId'] = this.legacyMyWellId;
    }

    if (this.hasLegacyMyWellId) {
      serialized['hasLegacyMyWellId'] = true;
    }

    if (this.legacyMyWellResourceId) {
      serialized['legacyMyWellResourceId'] = this.legacyMyWellResourceId;
    }

    if (this.hasLegacyMyWellResourceId) {
      serialized['hasLegacyMyWellResourceId'] = true;
    }

    return serialized;
  }

  public static deserialize(obj): ResourceIdType {
    let resourceIdType: ResourceIdType = new ResourceIdType();
    Object.keys(obj).forEach(key => {
      resourceIdType[key] = obj[key];
    });

    return resourceIdType;
  }

}