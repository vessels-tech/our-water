"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FileDatasource = void 0;

var _DatasourceType = require("../../enums/DatasourceType");

var _FileDatasourceTypes = require("../../enums/FileDatasourceTypes");

var _utils = require("../../utils");

var _Reading = require("../Reading");

var moment = _interopRequireWildcard(require("moment"));

var _ResourceIdType = _interopRequireDefault(require("../../types/ResourceIdType"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/**
 * Defines a datasource which parses information from a file
 * for now, we will implement readings only, but eventually
 * we may want to subclass this and specialize further or something
 * 
 * When a user defines this class, they will put in a file location, as well
 * as a type of file - e.g. readings, resource or group. We will implement readings first
 * The user can also put in settings, such as file type (csv, xlsx), and separator type (comma, tab)
 * and whether or not is uses legacyMyWellIds or ourwater ids
 * 
 * In order to check the format of the file, user can run the sync with a validateOnly option 
 *
 */
var FileDatasource =
/*#__PURE__*/
function () {
  function FileDatasource(fileUrl, dataType, fileFormat, options) {
    _classCallCheck(this, FileDatasource);

    Object.defineProperty(this, "type", {
      configurable: true,
      enumerable: true,
      writable: true,
      value: _DatasourceType.DatasourceType.FileDatasource
    });
    Object.defineProperty(this, "fileUrl", {
      configurable: true,
      enumerable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "dataType", {
      configurable: true,
      enumerable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "fileFormat", {
      configurable: true,
      enumerable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "options", {
      configurable: true,
      enumerable: true,
      writable: true,
      value: void 0
    });
    this.fileUrl = fileUrl;
    this.dataType = dataType;
    this.fileFormat = fileFormat;
    this.options = options;
  } //TODO: move elsewhere


  _createClass(FileDatasource, [{
    key: "convertRowsToModels",
    value: function convertRowsToModels(orgId, rows, dataType, options) {
      switch (dataType) {
        case _FileDatasourceTypes.DataType.Reading:
          if (!options.usesLegacyMyWellIds) {
            throw new Error('only legacy readings implemented for the Reading DataType');
          }

          return rows.map(function (row, idx) {
            if (options.includesHeadings && idx === 0) {
              return null;
            } //TODO: support other row orders


            var _row = _slicedToArray(row, 4),
                dateStr = _row[0],
                pincode = _row[1],
                legacyResourceId = _row[2],
                valueStr = _row[3];

            if ((0, _utils.isNullOrEmpty)(dateStr) || (0, _utils.isNullOrEmpty)(pincode) || (0, _utils.isNullOrEmpty)(legacyResourceId) || (0, _utils.isNullOrEmpty)(valueStr)) {
              console.log("Found row with missing data:", row);
              return null;
            }

            var date = (0, moment)(dateStr);

            if (!date.isValid()) {
              console.log("Row has invalid date:", row, dateStr);
              return null;
            }

            var resourceType = (0, _utils.resourceTypeForLegacyResourceId)(legacyResourceId);

            var newReading = _Reading.Reading.legacyReading(orgId, resourceType, date.toDate(), Number(valueStr), _ResourceIdType.default.fromLegacyReadingId(null, pincode, legacyResourceId));

            return newReading;
          });

        case _FileDatasourceTypes.DataType.Group:
        case _FileDatasourceTypes.DataType.Resource:
        default:
          throw new Error('ConvertRowsToModels not yet implemented for these DataTypes');
      }
    }
  }, {
    key: "validate",
    value: function validate(orgId, fs) {
      var _this = this;

      //Download the file to local
      //parse and don't save
      //TODO: return this
      return (0, _utils.downloadAndParseCSV)(this.fileUrl).then(function (rows) {
        return _this.convertRowsToModels(orgId, rows, _this.dataType, _this.options);
      }).then(function (modelsAndNulls) {
        var models = modelsAndNulls.filter(function (model) {
          return model !== null;
        });
        var nulls = modelsAndNulls.filter(function (model) {
          return model === null;
        });
        var result = {
          results: ["Validated ".concat(models.length, " readings.")],
          warnings: ["A total of ".concat(nulls.length, " readings were invalid or missing data, and filtered out.")],
          errors: []
        };
        return result;
      }).catch(function (err) {
        return {
          results: [],
          warnings: [],
          errors: [err]
        };
      });
    }
  }, {
    key: "pullDataFromDataSource",
    value: function pullDataFromDataSource(orgId, fs) {
      var _this2 = this;

      //download the file to local
      //deserialize based on some settings
      //if no errors, 
      //  Save the rows in a batch job
      //  run a batch job which adds group and resource metadata to readings
      var result = {
        results: [],
        warnings: [],
        errors: []
      }; //TODO: return this

      (0, _utils.downloadAndParseCSV)(this.fileUrl).then(function (rows) {
        return _this2.convertRowsToModels(orgId, rows, _this2.dataType, _this2.options);
      }).then(function (modelsAndNulls) {
        var models = modelsAndNulls.filter(function (model) {
          return model !== null;
        });
        var nulls = modelsAndNulls.filter(function (model) {
          return model === null;
        });
        result.results = ["Validated ".concat(models.length, " readings.")];
        result.warnings = ["A total of ".concat(nulls.length, " readings were invalid or missing data, and filtered out.")]; //TODO: batch save
      });
      return Promise.resolve(result);
    }
  }, {
    key: "pushDataToDataSource",
    value: function pushDataToDataSource() {
      throw new Error("not implemented for this datasource");
    }
  }, {
    key: "serialize",
    value: function serialize() {
      return {
        fileUrl: this.fileUrl,
        dataType: this.dataType,
        options: this.options.serialize(),
        type: this.type.toString()
      };
    }
  }]);

  return FileDatasource;
}();

exports.FileDatasource = FileDatasource;