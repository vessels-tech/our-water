import { GroupType } from "../enums/GroupType";
import { GeoPoint } from "@google-cloud/firestore";
import { org } from "../..";

export class Group {
  id: string
  orgId: string
  name: string
  type: GroupType
  coords: Array<GeoPoint>
  createdAt: Date
  updatedAt: Date

  constructor(name: string, orgId: string, type: GroupType, coords: Array<GeoPoint>) {
    this.name = name;
    this.orgId = orgId;
    this.type = type;
    this.coords = coords;
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
    return {
      id: this.id, 
      name: this.name,
      type: this.type,
      coords: this.coords,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}