"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SyncMethodValidation = exports.SyncMethod = void 0;

// import * as Joi from 'joi';
var Joi = require('joi');

var SyncMethod;
exports.SyncMethod = SyncMethod;

(function (SyncMethod) {
  SyncMethod[SyncMethod["validate"] = 'validate'] = "validate";
  SyncMethod[SyncMethod["pushTo"] = 'pushTo'] = "pushTo";
  SyncMethod[SyncMethod["pullFrom"] = 'pullFrom'] = "pullFrom";
  SyncMethod[SyncMethod["get"] = 'get'] = "get";
  SyncMethod[SyncMethod["post"] = 'post'] = "post";
})(SyncMethod || (exports.SyncMethod = SyncMethod = {}));

var SyncMethodValidation = Joi.valid(SyncMethod.validate, SyncMethod.pushTo, SyncMethod.pullFrom);
exports.SyncMethodValidation = SyncMethodValidation;