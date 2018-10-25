"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FileFormat = exports.DataType = void 0;
var DataType;
exports.DataType = DataType;

(function (DataType) {
  DataType[DataType["Reading"] = 'Reading'] = "Reading";
  DataType[DataType["Resource"] = 'Resource'] = "Resource";
  DataType[DataType["Group"] = 'Group'] = "Group";
})(DataType || (exports.DataType = DataType = {}));

var FileFormat;
exports.FileFormat = FileFormat;

(function (FileFormat) {
  FileFormat[FileFormat["CSV"] = 'CSV'] = "CSV";
  FileFormat[FileFormat["TSV"] = 'TSV'] = "TSV";
})(FileFormat || (exports.FileFormat = FileFormat = {}));