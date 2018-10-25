"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const functions = require("firebase-functions");
const envConfig = functions.config();
exports.mywellLegacyAccessToken = envConfig.config.mywell_legacy_access_token;
//# sourceMappingURL=env.js.map