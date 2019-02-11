import { FirestoreDoc } from "./FirestoreDoc";


//TODO: should this be a generic enum? or defined per type?
export enum ReadingType {
  Any = 'Any',
  MyWell = 'MyWell',
  GGMN = 'GGMN',
}

//Not 100% sure if this type of AnyReading will work
export type AnyReading = Reading | MyWellReading | GGMNReading;
export type Reading = {
  type: ReadingType.Any;
  datetime: string; //iso formatted string
  value: number;
};

export type MyWellReading = {
  type: ReadingType.MyWell;
  datetime: string; //iso formatted string
  value: number;
  isLegacy: boolean, 
}

export type GGMNReading = {
  type: ReadingType.GGMN,
  datetime: string; //iso formatted string
  value: number;
  secretField: number,
}



export class ReadingDoc extends FirestoreDoc<AnyReading> {
  docName = "reading";

}

const mywellReading: AnyReading = {
  type: ReadingType.MyWell,
  isLegacy: false,
  datetime: "12345",
  value: 10,
}

const myWellReadingDoc = new ReadingDoc(myWellReading);

