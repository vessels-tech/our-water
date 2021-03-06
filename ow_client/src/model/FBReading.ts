import FirestoreDoc from "./FirestoreDoc";
import { OrgType } from "../typings/models/OrgType";
import { MaybeReadingImage } from "../typings/models/ReadingImage";
import { MaybeReadingLocation } from "../typings/models/ReadingLocation";
import { AnyReading, GGMNReading, MyWellReading } from "../typings/models/Reading";
import { ResourceType } from "../enums";

export type CommonReadingBuilder = {
  orgId: string,
  type: OrgType,
  pending: boolean,
  deleted: boolean,
  resourceId: string,
  timeseriesId: string,
  date: string,
  value: number,
}

export type MyWellReadingBuilder = {
  userId?: string,
  image?: MaybeReadingImage,
  location?: MaybeReadingLocation, //This is the location that the reading was taken, not the coords of the resource the readings is for
  
  resourceType?: ResourceType
  datetime?: string
  isResourcePending?: boolean
}

export type GGMNReadingBuilder = {
  groundwaterStationId?: string,
}

export default class FBReading extends FirestoreDoc {
  docName = 'reading'

  // @ts-ignore
  id: string
  orgId: string

  type: OrgType
  pending: boolean
  deleted: boolean
  resourceId: string
  timeseriesId: string
  date: string
  value: number

  /* MyWell Specific */
  userId?: string
  image?: MaybeReadingImage
  location?: MaybeReadingLocation
  resourceType?: ResourceType
  datetime?: string
  isResourcePending?: boolean

  /* GGMN Specific */
  groundwaterStationId?: string

  constructor(builder: CommonReadingBuilder & MyWellReadingBuilder & GGMNReadingBuilder) {
    super();

    this.orgId = builder.orgId;
    this.type = builder.type;
    this.pending = builder.pending;
    this.deleted = builder.deleted;
    this.resourceId = builder.resourceId;
    this.timeseriesId = builder.timeseriesId;
    this.date = builder.date;
    this.value = builder.value;
    this.userId = builder.userId;
    this.image = builder.image;
    this.location = builder.location;
    this.groundwaterStationId = builder.groundwaterStationId;
    this.isResourcePending = builder.isResourcePending;

    this.datetime = builder.datetime;
    this.resourceType = builder.resourceType;
  }

  public serialize(): any {
    return {
      type: this.type,
      resourceType: this.resourceType,
      datetime: this.datetime,
      pending: this.pending,
      deleted: this.deleted,
      resourceId: this.resourceId,
      timeseriesId: this.timeseriesId,
      date: this.date,
      value: this.value,
      userId: this.userId,
      image: this.image,
      location: this.location,
      groundwaterStationId: this.groundwaterStationId,
      isResourcePending: this.isResourcePending,
      ...super.serialize(),
    }
  }

  public static deserialize(data: any): FBReading {
    const builder: CommonReadingBuilder & MyWellReadingBuilder & GGMNReadingBuilder = { ...data };
    const des: FBReading = new FBReading(builder);

    //private fields
    des.id = data.id;
    des.createdAt = data.createdAt;
    des.updatedAt = data.updatedAt;

    return des;
  }

  public static fromDoc(doc: any): FBReading {
    return this.deserialize(doc.data());
  }

  public toAnyReading(): AnyReading {

    switch(this.type) {
      case OrgType.GGMN: {
        const reading: GGMNReading = {
          type: this.type,
          resourceId: this.resourceId,
          timeseriesId: this.timeseriesId,
          date: this.date,
          value: this.value,
          groundwaterStationId: this.groundwaterStationId,
        }
        return reading;
      }
      case OrgType.MYWELL: {
        const reading: MyWellReading = {
          type: this.type,
          resourceId: this.resourceId,
          timeseriesId: this.timeseriesId,
          date: this.date,
          value: this.value,
          userId: this.userId,
          image: this.image,
          location: this.location,
        }
        return reading;
      }
      default: 
        throw new Error(`Tried to convert FBReading to AnyReading for type: ${this.type}`);
    }
  }
}