"use strict";
/**
 * This is a workaround for some issues with different GeoPoints
 * being included in the Firebase libs, and allows us to control
 * exactly what GeoPoint is being used
 */
Object.defineProperty(exports, "__esModule", { value: true });
const admin = require('firebase-admin');
// import {admin} from 'firebase-admin';
exports.default = admin.firestore.GeoPoint;
//# sourceMappingURL=OWGeoPoint.js.map