"use strict";
// import * as Joi from 'joi';
Object.defineProperty(exports, "__esModule", { value: true });
const Joi = require('joi');
var SyncMethod;
(function (SyncMethod) {
    SyncMethod["validate"] = "validate";
    SyncMethod["pushTo"] = "pushTo";
    SyncMethod["pullFrom"] = "pullFrom";
    // to be implemented later:
    SyncMethod["get"] = "get";
    SyncMethod["post"] = "post";
})(SyncMethod = exports.SyncMethod || (exports.SyncMethod = {}));
const SyncMethodValidation = Joi.valid(SyncMethod.validate, SyncMethod.pushTo, SyncMethod.pullFrom);
exports.SyncMethodValidation = SyncMethodValidation;
//# sourceMappingURL=SyncMethod.js.map