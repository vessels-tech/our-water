import FirestoreDoc, { FirestoreDocTypes } from "./FirestoreDoc";
import { SomeResult } from "../types/AppProviderTypes";
import { runInThisContext } from "vm";


export interface ShortIdType {
  shortId: string,
  longId: string,
  lastUsed: Date,
}

export default class ShortId extends FirestoreDoc {
  static docName = 'shortId';
  shortId: string;
  longId: string;
  lastUsed: Date;

  //createdAt, updatedAt, orgId from FirestoreDoc

  public static fromShortId(orgId: string, props: ShortIdType): ShortId {
    return new ShortId({
      ...props,
      id: props.shortId,
      docName: ShortId.docName,
      orgId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  constructor(props: ShortIdType & FirestoreDocTypes) {
    super();

    this.shortId = props.shortId;
    this.longId = props.longId;
    this.lastUsed = props.lastUsed;
    this.docName = props.docName;
    this.orgId = props.orgId;
    this.id = props.id;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }


  public serialize(): ShortIdType & FirestoreDocTypes {
    return {
      docName: this.docName,
      id: this.id,
      orgId: this.orgId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      shortId: this.shortId,
      longId: this.longId,
      lastUsed: this.lastUsed,
    };
  }

  public static deserialize(data: ShortIdType & FirestoreDocTypes): ShortId {
    return new ShortId(data);
  }
}
