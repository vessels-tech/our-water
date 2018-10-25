"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var admin = require('firebase-admin');

if (admin.apps.length === 0) {
  admin.initializeApp();
}

var firestore = admin.firestore();
var settings = {
  /* your settings... */
  timestampsInSnapshots: true
};
firestore.settings(settings);
var _default = firestore;
exports.default = _default;