import { Resource } from "../models/Resource";
import ResourceIdType from "../types/ResourceIdType";
import { ResourceType } from "../enums/ResourceType";
import { Reading } from "../models/Reading";
import { OWGeoPoint } from "ow_types";
import moment = require("moment");


//TODO: this is outdated, update to new cohesive model
export function basicResource(orgId: string): Resource {
  return Resource.build({
    orgId,
    externalIds: ResourceIdType.none(),
    groups: new Map(),
    coords: {
      latitude: -34.8438,
      longitude: 138.5073,
    },
    owner: {
      name: "lewis",
      createdByUserId: '1'
    },
    // pending: true,
    resourceType: ResourceType.Quality,
    //This is broken...
    timeseries: {
      "default": { id: "default" },
    }
    // type: "MYWELL",
    // userId: "user_a",
  })
}


export function basicReading(orgId: string): Reading {
  const reading = new Reading(orgId, 'resA', new OWGeoPoint(35.0123, 35.0123), ResourceType.well, {}, moment('2018-01-01').toDate(), 100, ResourceIdType.none());
  return reading;
}




/**
 * Prefilled firebase with data in user's pending resources and pending readings
 */
export function pendingResourcesData(orgId: string): any {
  const data = {
    __collection__: {
      org: {
        __doc__: {
        }
      }
    }
  };

  data.__collection__.org.__doc__[orgId] = {
    __collection__: {
      user: {
        __doc__: {
          user_a: {
            __collection__: {
              pendingResources: {
                __doc__: {
                  12345: {
                    coords: {
                      latitude: -34.8438,
                      longitude: 138.5073,
                    },
                    name: null,
                    owner: {
                      name: "lewis",
                    },
                    pending: true,
                    resourceType: "quality",
                    timeseries: [
                      { name: "default", parameter: "gwmbgs" },
                    ],
                    type: "MYWELL",
                    userId: "user_a",
                  },
                  12346: {
                    coords: {
                      latitude: -34.8438,
                      longitude: 138.5073,
                    },
                    name: null,
                    owner: {
                      name: "lewis",
                    },
                    pending: true,
                    resourceType: "quality",
                    timeseries: [
                      { name: "default", parameter: "gwmbgs" },
                    ],
                    type: "MYWELL",
                    userId: "user_a",
                  },
                  12347: {
                    coords: {
                      latitude: -34.8438,
                      longitude: 138.5073,
                    },
                    name: null,
                    owner: {
                      name: "lewis",
                    },
                    pending: true,
                    resourceType: "quality",
                    timeseries: [
                      { name: "default", parameter: "gwmbgs" },
                    ],
                    type: "MYWELL",
                    userId: "user_a",
                  },
                }
              },
              pendingReadings: {
                __doc__: {
                  12345: {
                    createdAt: null,
                    date: "2018-12-11T01:28:50Z",
                    deleted: false,
                    docName: "reading",
                    id: null,
                    image: { type: "NONE" },
                    location: { _latitude: -34.85434, _longitude: 138.123 },
                    orgId: "mywell",
                    pending: false,
                    resourceId: "MRKR5318r0mQFn9EBJfq",
                    timeseriesId: "gwmbgs",
                    type: "MYWELL",
                    updatedAt: null,
                    userId: "Czo8mvg8aLXAN4jUoeThbIwWtok1",
                    value: 36,
                    resourceType: 'well',
                  },
                  12346: {
                    createdAt: null,
                    date: "2018-12-11T01:28:50Z",
                    deleted: false,
                    docName: "reading",
                    id: null,
                    image: { type: "NONE" },
                    location: { _latitude: -34.85434, _longitude: 138.123 },
                    orgId: "mywell",
                    pending: false,
                    resourceId: "MRKR5318r0mQFn9EBJfq",
                    timeseriesId: "gwmbgs",
                    type: "MYWELL",
                    updatedAt: null,
                    userId: "Czo8mvg8aLXAN4jUoeThbIwWtok1",
                    value: 36,
                    resourceType: 'well',
                  }
                }
              }
            }
          }
        }
      }
    }
  };

  return data;
}