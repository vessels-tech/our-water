/**
 * A MyWell Reading as reflected by LegacyMyWell
 * 
 * 
* {
    "date": "2018-08-03T00:15:28.920Z",
    "value": 0,
    "villageId": 0,
    "postcode": 0,
    "id": 0,
    "resourceId": 0,
    "createdAt": "2018-08-03T00:15:28.920Z",
    "updatedAt": "2018-08-03T00:15:28.920Z"
  } 
 */

//TODO: remove this, use LegacyReading instead
export type LegacyMyWellReading = {

  date: string,
  value: number,
  villageId: number, 
  postcode: number,
  id?: number,
  resourceId: number, 
  createdAt: string, //ISO format
  updatedAt: string,
}