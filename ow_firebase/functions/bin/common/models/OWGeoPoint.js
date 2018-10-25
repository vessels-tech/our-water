'use strict';

/**
 * This is a workaround for some issues with different GeoPoints
 * being included in the Firebase libs, and allows us to control
 * exactly what GeoPoint is being used
 * 
 * Ideally this would also be a .ts file, but the way that 
 * firebase-admin is exported seems to mess with the compiler
 */

var admin = require('firebase-admin');
// import {admin} from 'firebase-admin'; //not working

module.exports = admin.firestore.GeoPoint;
//# sourceMappingURL=OWGeoPoint.js.map