"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.mywellLegacyAccessToken = void 0;

var functions = _interopRequireWildcard(require("firebase-functions"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

var envConfig = functions.config();
var mywellLegacyAccessToken = envConfig.config.mywell_legacy_access_token;
exports.mywellLegacyAccessToken = mywellLegacyAccessToken;