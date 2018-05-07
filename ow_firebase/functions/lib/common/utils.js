"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const firestore_1 = require("@google-cloud/firestore");
/**
 * Create a diamond shape from a latlng
 * use this to easily convert from a legacy village into a Group
 */
exports.createDiamondFromLatLng = (lat, lng, delta) => {
    let minLat, maxLng, maxLat, minLng = null;
    minLat = new firestore_1.GeoPoint(lat - delta, lng);
    maxLng = new firestore_1.GeoPoint(lat, lng + delta);
    maxLat = new firestore_1.GeoPoint(lat + delta, lng);
    minLng = new firestore_1.GeoPoint(lat, lng - delta);
    //I suppose we should assume indexes 0 and -1 line up
    return [minLat, maxLng, maxLat, minLng];
};
//# sourceMappingURL=utils.js.map