"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Resource_1 = require("../models/Resource");
const ResourceIdType_1 = require("../types/ResourceIdType");
const ResourceType_1 = require("../enums/ResourceType");
const Reading_1 = require("../models/Reading");
const ow_types_1 = require("ow_types");
const moment = require("moment");
//TODO: this is outdated, update to new cohesive model
function basicResource(orgId) {
    return Resource_1.Resource.build({
        orgId,
        externalIds: ResourceIdType_1.default.none(),
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
        resourceType: ResourceType_1.ResourceType.Quality,
        //This is broken...
        timeseries: {
            "default": { id: "default" },
        }
        // type: "MYWELL",
        // userId: "user_a",
    });
}
exports.basicResource = basicResource;
function basicReading(orgId) {
    const reading = new Reading_1.Reading(orgId, 'resA', new ow_types_1.OWGeoPoint(35.0123, 35.0123), ResourceType_1.ResourceType.well, {}, moment('2018-01-01').toDate(), 100, ResourceIdType_1.default.none());
    return reading;
}
exports.basicReading = basicReading;
/**
 * Prefilled firebase with data in user's pending resources and pending readings
 */
function pendingResourcesData(orgId) {
    const data = {
        __collection__: {
            org: {
                __doc__: {}
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
exports.pendingResourcesData = pendingResourcesData;
//# sourceMappingURL=Data.js.map