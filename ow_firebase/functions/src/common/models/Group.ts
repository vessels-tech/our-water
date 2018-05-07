import { GroupType } from "../enums/GroupType";
import { GeoPoint } from "@google-cloud/firestore";
import { org } from "../..";

export class Group {
  id: string
  orgId: string
  name: string
  type: GroupType
  coords: Array<GeoPoint>

  constructor(name: string, orgId: string, type: GroupType, coords: Array<GeoPoint>) {
    this.name = name;
    this.orgId = orgId;
    this.type = type;
    this.coords = coords;
  }

  public create({ fs }): Promise<Group> {
    const newRef = fs.collection('org').doc(this.orgId).collection('group').doc();
    this.id = newRef.id;

    return this.save({fs});
  }

  public save({fs }): Promise<Group> {
    return fs.collection('org').doc(this.orgId).collection('group').doc(this.id)
      .set(this.serialize())
      .then(ref => {
        return this;
      });
  }

  // public static bulkGroup(fs, groups: Array<Group>): Promise<Array<Group>> {


  // }

  public serialize(): any {
    return {
      id: this.id, 
      name: this.name,
      type: this.type,
      coords: this.coords,
    };
  }
}