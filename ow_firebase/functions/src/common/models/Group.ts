import { GroupType } from "../enums/GroupType";
import ResourceIdType from "../types/ResourceIdType";
import { isNullOrUndefined } from "util";
import OWGeoPoint from '../models/OWGeoPoint';


export class Group {
  id: string
  orgId: string
  name: string
  type: GroupType
  coords: Array<OWGeoPoint>
  externalIds: ResourceIdType
  createdAt: Date
  updatedAt: Date

  constructor(name: string, orgId: string, type: GroupType,
    coords: Array<OWGeoPoint>, externalIds: ResourceIdType) {
    this.name = name;
    this.orgId = orgId;
    this.type = type;
    this.coords = coords;
    this.externalIds = externalIds;
  }

  public create({ firestore }): Promise<Group> {
    const newRef = firestore.collection('org').doc(this.orgId).collection('group').doc();
    this.id = newRef.id;
    this.createdAt = new Date();

    return this.save({ firestore});
  }

  public save({ firestore }): Promise<Group> {
    if (!this.id) {
      throw new Error('Tried to save, but object has not been created yet. Use create() instead.');
    }
    this.updatedAt = new Date();
  
    return firestore.collection('org').doc(this.orgId).collection('group').doc(this.id)
      .set(this.serialize())
      .then(ref => {
        return this;
      });
  }

  public static saveBulkGroup(firestore, groups: Array<Group>): Promise<Array<Group>> {

    return Promise.resolve([]);
  }

  public serialize(): any {

    const base = {
      id: this.id, 
      name: this.name,
      type: this.type,
      coords: this.coords,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };

    //TODO: this is less than ideal
    if (this.externalIds) {
      let serializedExternalId = null;
      try {
        serializedExternalId = this.externalIds.serialize();
        if (!isNullOrUndefined(serializedExternalId.legacyMyWellId)) {
          base['externalIds'] = serializedExternalId;
        }
      } catch (err) {
        console.log("Error", err);
      }
    }

    return base;
  }
}