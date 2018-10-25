"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.validateDatatypes = exports.validateDatatype = exports.SyncDatatypeList = exports.SyncDatatypes = void 0;
var SyncDatatypes = {
  reading: 'Reading',
  resource: 'Resource',
  group: 'Group'
};
exports.SyncDatatypes = SyncDatatypes;
var SyncDatatypeList = Object.keys(SyncDatatypes).map(function (key) {
  return SyncDatatypes[key];
});
/**
 * Throw if the given datatype is not in the SyncDatatypes
 */

exports.SyncDatatypeList = SyncDatatypeList;

var validateDatatype = function validateDatatype(datatype) {
  if (SyncDatatypeList.indexOf(datatype) === -1) {
    throw new Error("Could not find datatype: ".concat(datatype, " in SyncDatatypeList."));
  }
};

exports.validateDatatype = validateDatatype;

var validateDatatypes = function validateDatatypes(datatypes) {
  datatypes.forEach(function (datatype) {
    return validateDatatype(datatype);
  });
};

exports.validateDatatypes = validateDatatypes;