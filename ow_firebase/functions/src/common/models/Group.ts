import { GroupType } from "../enums/GroupType";
import { GeoPoint } from "@google-cloud/firestore";
import { org } from "../..";
import { serializeMap } from "../utils";
import ResourceIdType from "../types/ResourceIdType";
import { isNullOrUndefined } from "util";

export class Group {
  id: string
  orgId: string
  name: string
  type: GroupType
  coords: Array<GeoPoint>
  externalIds: ResourceIdType
  createdAt: Date
  updatedAt: Date

  constructor(name: string, orgId: string, type: GroupType,
     coords: Array<GeoPoint>, externalIds: ResourceIdType) {
    this.name = name;
    this.orgId = orgId;
    this.type = type;
    this.coords = coords;
    this.externalIds = externalIds;
  }

  public create({ fs }): Promise<Group> {
    const newRef = fs.collection('org').doc(this.orgId).collection('group').doc();
    this.id = newRef.id;
    this.createdAt = new Date();

    return this.save({fs});
  }

  public save({ fs }): Promise<Group> {
    this.updatedAt = new Date();
  
    return fs.collection('org').doc(this.orgId).collection('group').doc(this.id)
      .set(this.serialize())
      .then(ref => {
        return this;
      });
  }

  public static saveBulkGroup(fs, groups: Array<Group>): Promise<Array<Group>> {

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
      } catch {

      }
    }

    console.log("base is:", base);

    return base;
  }
}