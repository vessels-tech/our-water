"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.resultWithError = exports.isNullOrEmpty = exports.hashIdToIntegerString = exports.hashCode = exports.resourceIdForResourceType = exports.resourceTypeForLegacyResourceId = exports.downloadAndParseCSV = exports.anyToMap = exports.serializeMap = exports.findGroupMembershipsForReading = exports.findResourceMembershipsForResource = exports.findGroupMembershipsForResource = exports.getLegacyMyWellResources = exports.getLegacyMyWellGroups = exports.createDiamondFromLatLng = exports.concatSaveResults = exports.snapshotToSyncRunList = exports.snapshotToSyncList = exports.snapshotToResourceList = void 0;

var _OWGeoPoint = _interopRequireDefault(require("../common/models/OWGeoPoint"));

var _Resource = require("./models/Resource");

var Papa = _interopRequireWildcard(require("papaparse"));

var request = _interopRequireWildcard(require("request-promise-native"));

var _ResourceType = require("./enums/ResourceType");

var _Sync = require("./models/Sync");

var _SyncRun = require("./models/SyncRun");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

/**
 * From a snapshot [eg. fs.collection('org').doc(orgId).collection('resource').get()]
 * iterate through and return a list of resources
 * 
 * //TODO: make type generic
 */
var snapshotToResourceList = function snapshotToResourceList(sn) {
  var resources = [];
  sn.forEach(function (doc) {
    return resources.push(_Resource.Resource.fromDoc(doc));
  });
  return resources;
};

exports.snapshotToResourceList = snapshotToResourceList;

var snapshotToSyncList = function snapshotToSyncList(sn) {
  var syncs = [];
  sn.forEach(function (doc) {
    return syncs.push(_Sync.Sync.fromDoc(doc));
  });
  return syncs;
};

exports.snapshotToSyncList = snapshotToSyncList;

var snapshotToSyncRunList = function snapshotToSyncRunList(sn) {
  var syncRuns = []; //TODO: change to fromDoc

  sn.forEach(function (doc) {
    return syncRuns.push(_SyncRun.SyncRun.deserialize(doc));
  });
  return syncRuns;
}; // export const snapshotToFirestoreDoc = (sn): Array<FirestoreDoc> => {
//   const resources: Array<FirestoreDoc> = [];
//   sn.forEach(doc => resources.push(FirestoreDoc.fromDoc(doc)));
//   return resources;
// }

/**
 * Concatenate a list of results together, keeping the results, warnings, errors
 * format
 */


exports.snapshotToSyncRunList = snapshotToSyncRunList;

var concatSaveResults = function concatSaveResults(resultList) {
  return resultList.reduce(function (acc, curr) {
    return {
      results: acc.results.concat(curr.results),
      warnings: acc.warnings.concat(curr.warnings),
      errors: acc.errors.concat(curr.errors)
    };
  }, {
    results: [],
    warnings: [],
    errors: []
  });
};
/**
 * Create a diamond shape from a latlng
 * use this to easily convert from a legacy village into a Group
 */


exports.concatSaveResults = concatSaveResults;

var createDiamondFromLatLng = function createDiamondFromLatLng(lat, lng, delta) {
  var minLat,
      maxLng,
      maxLat,
      minLng = null;
  minLat = new _OWGeoPoint.default(lat - delta, lng);
  maxLng = new _OWGeoPoint.default(lat, lng + delta);
  maxLat = new _OWGeoPoint.default(lat + delta, lng);
  minLng = new _OWGeoPoint.default(lat, lng - delta); //I suppose we should assume indexes 0 and -1 line up

  return [minLat, maxLng, maxLat, minLng];
};
/**
 * Get all of the groups that contain legacyIds, and format them as:
 *     a dict where key=legacyid (pincode, or pincode.villageId), value=new group
 * @param fs Firestore database
 */


exports.createDiamondFromLatLng = createDiamondFromLatLng;

var getLegacyMyWellGroups = function getLegacyMyWellGroups(orgId, fs) {
  var mappedGroups = new Map();
  return fs.collection('org').doc(orgId).collection('group').where('externalIds.hasLegacyMyWellPincode', '==', true).get().then(function (sn) {
    var groups = [];
    sn.forEach(function (result) {
      return groups.push(result.data());
    });
    console.log("Found: ".concat(groups.length, " groups.")); //TODO: this will die, we need to deserialize properly

    groups.forEach(function (group) {
      if (!group.externalIds) {
        console.log("group is missing externalIds", group);
        return;
      }

      mappedGroups.set(group.externalIds.getMyWellId(), group);
    });
    return mappedGroups;
  });
};
/**
 * Get all of the resources that contain legacyIds, and format them as:
 *     a dict where key=legacyid (pincode, or pincode.villageId), value=new resource
 * @param fs Firestore database
 */


exports.getLegacyMyWellGroups = getLegacyMyWellGroups;

var getLegacyMyWellResources = function getLegacyMyWellResources(orgId, fs) {
  var mappedResources = new Map();
  return fs.collection('org').doc(orgId).collection('resource').where('externalIds.hasLegacyMyWellId', '==', true).get().then(function (sn) {
    var resources = [];
    sn.forEach(function (result) {
      return resources.push(result.data());
    });
    console.log("getLegacyMyWellResources Found: ".concat(resources.length, " resources.")); //TODO: this will die, we need to deserialize properly

    resources.forEach(function (res) {
      if (!res.externalIds) {
        //TODO: not sure what to do here. This should probably be a warning
        console.log("resource is missing externalIds", res.id);
        return;
      }

      mappedResources[res.externalIds.getMyWellId()] = res;
    });
    console.log("found ".concat(Object.keys(mappedResources).length, " getLegacyMyWellResources:"));
    return mappedResources;
  });
};
/**
 * Looks up a new group membership for a legacy resource
 * 
 * @param legacyResource 
 * @param legacyGroups - a dict where key=legacyid (pincode, or pincode.villageId), value=new group
 * @returns any - of shape: for each groupId (that the resource is in.)
 * {
 *  groupId: 'true'
 * }
 */


exports.getLegacyMyWellResources = getLegacyMyWellResources;

var findGroupMembershipsForResource = function findGroupMembershipsForResource(legacyResource, groups) {
  var memberships = new Map(); // console.log("findGroupMembershipsForResource Groups:", groups);

  var villageGroup = groups.get("".concat(legacyResource.postcode, ".").concat(legacyResource.villageId));

  if (villageGroup) {
    memberships.set(villageGroup.id, true);
  }

  var pincodeGroup = groups.get("".concat(legacyResource.postcode));

  if (pincodeGroup) {
    memberships.set(pincodeGroup.id, true);
  } // console.log("findGroupMembershipsForResource, ", memberships);


  return memberships;
};
/**
 * Looks up a new Resource membership for a legacy resource
 * 
 * @param legacyReading
 * @param resources - a dict where key=legacyid, value=new resource
 * @returns a single Resource
 */


exports.findGroupMembershipsForResource = findGroupMembershipsForResource;

var findResourceMembershipsForResource = function findResourceMembershipsForResource(legacyReading, resources) {
  var res = resources["".concat(legacyReading.postcode, ".").concat(legacyReading.resourceId)];

  if (!res) {
    console.log("no resource found for ids: ".concat(legacyReading.postcode, ".").concat(legacyReading.resourceId));
    throw new Error("no resource found for ids: ".concat(legacyReading.postcode, ".").concat(legacyReading.resourceId, " this shouldn't happen"));
  }

  return res;
};
/**
 * Looks up a new Group membership for a legacy reading
 * 
 * @param legacyReading
 * @param resources - a dict where key=legacyid, value=new resource
 * @returns a single Resource
 */


exports.findResourceMembershipsForResource = findResourceMembershipsForResource;

var findGroupMembershipsForReading = function findGroupMembershipsForReading(legacyReading, groups) {
  var memberships = new Map();
  var villageGroup = groups["mywell.".concat(legacyReading.postcode, ".").concat(legacyReading.villageId)];

  if (villageGroup) {
    memberships.set(villageGroup.id, true);
  }

  var pincodeGroup = groups.get("mywell.".concat(legacyReading.postcode));

  if (pincodeGroup) {
    memberships.set(pincodeGroup.id, true);
  }

  return memberships;
};

exports.findGroupMembershipsForReading = findGroupMembershipsForReading;

var serializeMap = function serializeMap(input) {
  if (!input) {
    return {};
  }

  return Array.from(input).reduce(function (obj, _ref) {
    var _ref2 = _slicedToArray(_ref, 2),
        key = _ref2[0],
        value = _ref2[1];

    return Object.assign(obj, _defineProperty({}, key, value));
  }, {});
};

exports.serializeMap = serializeMap;

var anyToMap = function anyToMap(input) {
  return Object.keys(input).reduce(function (acc, key) {
    var value = input[key];
    return acc.set(key, value);
  }, new Map());
};

exports.anyToMap = anyToMap;

var downloadAndParseCSV = function downloadAndParseCSV(url) {
  //TODO: this is not optimal, we should use streaming, and not read everything into memory first.
  //but it's late, and I'm tired
  return (0, request)(url).then(function (result) {
    return new Promise(function (resolve, reject) {
      Papa.parse(result, {
        error: function error(err) {
          console.log("Error parsing CSV");
          reject(err);
        },
        complete: function complete(res) {
          resolve(res.data);
        }
      });
    });
  });
};

exports.downloadAndParseCSV = downloadAndParseCSV;

var resourceTypeForLegacyResourceId = function resourceTypeForLegacyResourceId(legacyResourceId) {
  if (legacyResourceId.startsWith('117')) {
    return _ResourceType.ResourceType.Raingauge;
  }

  if (legacyResourceId.startsWith('118')) {
    return _ResourceType.ResourceType.Checkdam;
  }

  return _ResourceType.ResourceType.Well;
};

exports.resourceTypeForLegacyResourceId = resourceTypeForLegacyResourceId;

var resourceIdForResourceType = function resourceIdForResourceType(resourceType) {
  switch (resourceType) {
    case _ResourceType.ResourceType.Well:
      return '10';

    case _ResourceType.ResourceType.Raingauge:
      return '70';

    case _ResourceType.ResourceType.Checkdam:
      return '80';
  }
};
/**
 * Returns a hash code for a string.
 * (Compatible to Java's String.hashCode())
 *
 * The hash code for a string object is computed as
 *     s[0]*31^(n-1) + s[1]*31^(n-2) + ... + s[n-1]
 * using number arithmetic, where s[i] is the i th character
 * of the given string, n is the length of the string,
 * and ^ indicates exponentiation.
 * (The hash value of the empty string is zero.)
 * Ref: https://gist.github.com/hyamamoto/fd435505d29ebfa3d9716fd2be8d42f0
 *
 * @param {string} s a string
 * @return {number} a hash code value for the given string.
 */


exports.resourceIdForResourceType = resourceIdForResourceType;

var hashCode = function hashCode(s) {
  var h = 0,
      l = s.length,
      i = 0;
  if (l > 0) while (i < l) {
    h = (h << 5) - h + s.charCodeAt(i++) | 0;
  }
  return Math.abs(h);
};
/**
 * Convert an String id to a string of integers for the given length
 * Yes, I know we may eventually get a collision, but this is really just
 * so we can generate a simple Id that will be unique enough for Legacy MyWell.
 * 
 * We plan on using 6 integers, 10^6 = 1M possible values, so we should be fine.
 */


exports.hashCode = hashCode;

var hashIdToIntegerString = function hashIdToIntegerString(id, length) {
  var fullHash = "".concat(hashCode(id));
  return fullHash.substring(0, length);
};

exports.hashIdToIntegerString = hashIdToIntegerString;

var isNullOrEmpty = function isNullOrEmpty(stringOrNull) {
  if (!stringOrNull) {
    return true;
  }

  if (stringOrNull === '') {
    return true;
  }

  return false;
};
/**
 * return a sync run result with just one error
 */


exports.isNullOrEmpty = isNullOrEmpty;

var resultWithError = function resultWithError(error) {
  return {
    results: [],
    warnings: [],
    errors: [error]
  };
};

exports.resultWithError = resultWithError;