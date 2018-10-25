"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createSyncValidation = void 0;

var _SyncDatatypes = require("../common/types/SyncDatatypes");

var _SyncFrequency = require("../common/enums/SyncFrequency");

var Joi = require('joi');

var createSyncValidation = {
  options: {
    allowUnknownBody: false
  },
  body: {
    data: {
      isOneTime: Joi.boolean().required(),
      frequency: Joi.string().valid(_SyncFrequency.SyncFrequencyList).required(),
      datasource: Joi.object().keys({
        //TODO: add more to this later
        type: Joi.string().required(),
        //TODO: legacy options only
        url: Joi.string(),
        //TODO: file options:
        fileUrl: Joi.string(),
        dataType: Joi.string(),
        fileFormat: Joi.string(),
        options: Joi.object(),
        selectedDatatypes: Joi.array().items(Joi.string().valid(_SyncDatatypes.SyncDatatypeList)).required()
      }).required(),
      type: Joi.string().required()
    }
  }
};
exports.createSyncValidation = createSyncValidation;