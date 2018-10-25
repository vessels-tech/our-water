"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.deserializeDatasource = void 0;

var _LegacyMyWellDatasource = _interopRequireDefault(require("./LegacyMyWellDatasource"));

var _DatasourceType = require("../../enums/DatasourceType");

var _FileDatasource = require("./FileDatasource");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var deserializeDatasource = function deserializeDatasource(ser) {
  switch (ser.type) {
    case _DatasourceType.DatasourceType.LegacyMyWellDatasource:
      return new _LegacyMyWellDatasource.default(ser.baseUrl, ser.selectedDatatypes);

    case _DatasourceType.DatasourceType.FileDatasource:
      return new _FileDatasource.FileDatasource(ser.fileUrl, ser.dataType, ser.fileFormat, ser.options);

    default:
      throw new Error("Tried to deserialize datasource of type: ".concat(ser.type));
  }
};

exports.deserializeDatasource = deserializeDatasource;