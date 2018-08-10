import { isNullOrUndefined } from "util";

export default class ResourceIdType {
  /* The id (can be composite) that refers to this item in MyWell*/
  private legacyMyWellId?: string
  private hasLegacyMyWellId: boolean = false;

  /* the 4 digit resourceId for a resource */
  private legacyMyWellResourceId?: string
  private hasLegacyMyWellResourceId: boolean = false;

  /* the 2 digit villageId, also a 2 digit prefix to resourceId */
  private legacyMyWellVillageId?: string
  private hasLegacyMyWellVillageId: boolean = false;

  /* the pincode of the resource*/
  private legacyMyWellPincode?: string
  private hasLegacyMyWellPincode: boolean = false;

  //Add other bits and pieces here as needed

  static none(): ResourceIdType {
    return new ResourceIdType();
  }

  /**
   * When we create a resource in OW, and want to sync it to LegacyMyWell, 
   * it MUST have a postcode and villageId,  and NOT have a MyWellId
   */
  static newOWResource(pincode: any): ResourceIdType {
    const legacyId = new ResourceIdType();
    legacyId.legacyMyWellPincode = `${pincode}`;
    legacyId.hasLegacyMyWellPincode = true;

    legacyId.legacyMyWellVillageId = `11`;
    legacyId.hasLegacyMyWellVillageId = true;

    return legacyId;
  }

  static fromLegacyPincode(pincode: any): ResourceIdType {
    const legacyId = new ResourceIdType();
    legacyId.legacyMyWellPincode = `${pincode}`;
    legacyId.hasLegacyMyWellPincode = true;

    legacyId.legacyMyWellId = `${pincode}`;
    legacyId.hasLegacyMyWellId = true;

    return legacyId;
  }

  static fromLegacyVillageId(pincode: number, villageId: number): ResourceIdType {
    const legacyId = new ResourceIdType();
    legacyId.legacyMyWellId = `${pincode}.${villageId}`;
    legacyId.hasLegacyMyWellId = true;

    legacyId.legacyMyWellPincode = `${pincode}`;
    legacyId.hasLegacyMyWellPincode = true;

    legacyId.legacyMyWellVillageId = `${villageId}`;
    legacyId.hasLegacyMyWellVillageId = true;

    return legacyId;
  }

  static fromLegacyMyWellId(pincode: number, resourceId: number): ResourceIdType {
    const legacyId = new ResourceIdType();
    legacyId.legacyMyWellId = `${pincode}.${resourceId}`;
    legacyId.hasLegacyMyWellId = true;

    legacyId.legacyMyWellPincode = `${pincode}`;
    legacyId.hasLegacyMyWellPincode = true;

    legacyId.legacyMyWellVillageId = `${resourceId}`.substring(0, 2);
    legacyId.hasLegacyMyWellVillageId = true;

    legacyId.legacyMyWellResourceId = `${resourceId}`;
    legacyId.hasLegacyMyWellResourceId = true;

    return legacyId
  }

  static fromLegacyReadingId(id: number, pincode:number, resourceId: number): ResourceIdType {
    const legacyId = new ResourceIdType();
   
    legacyId.legacyMyWellId = `${id}`; //identifies this specific reading
    legacyId.hasLegacyMyWellId = true;

    legacyId.legacyMyWellPincode = `${pincode}`;
    legacyId.hasLegacyMyWellPincode = true;

    legacyId.legacyMyWellVillageId = `${resourceId}`.substring(0, 2);
    legacyId.hasLegacyMyWellVillageId = true;

    legacyId.legacyMyWellResourceId = `${resourceId}`; //identifies the reading's resource id
    legacyId.hasLegacyMyWellResourceId = true; //identified that the reading is linked to an external datasource

    return legacyId
  }

  /**
   * Get the generic Id string.
   * Could be for a pincode, village, resource or reading
   */
  public getMyWellId(): string {
    if (!this.hasLegacyMyWellId) {
      throw new Error('Tried to getMyWellId, but resource has no myWellId');
    }

    return this.legacyMyWellId;
  }

   /**
   * Parse the legacyMyWellResourceId, get the resourceId
   * throws if there is no legacyMyWellResourceId
   */
  public getResourceId(): number {
    if (!this.hasLegacyMyWellResourceId) {
      throw new Error('tried to getResourceId, but resource has no resourceId');
    }

    return parseInt(this.legacyMyWellResourceId);
  }

  /**
   * Parse the legacyMyWellResourceId, get the villageId
   * throws if there is no legacyMyWellResourceId
   */
  public getVillageId(): number {
    if (!this.hasLegacyMyWellVillageId) {
      throw new Error('tried to getVillageId, but could not find legacyMyWellVillageId.');
    }

    return parseInt(this.legacyMyWellVillageId);
  }
  
  /**
   * Parse the legacyMyWellResourceId, get postcode
   */
  public getPostcode() {
    if (!this.hasLegacyMyWellPincode) {
      throw new Error('tried to getPostcode, but could not find legacyMyWellPincode.');
    }

    return parseInt(this.legacyMyWellPincode);
  }

  public serialize(): any {
    return JSON.parse(JSON.stringify(this));
  }

  public static deserialize(obj): ResourceIdType {
    let resourceIdType: ResourceIdType = new ResourceIdType();
    Object.keys(obj).forEach(key => {
      resourceIdType[key] = obj[key];
    });

    return resourceIdType;
  }

}