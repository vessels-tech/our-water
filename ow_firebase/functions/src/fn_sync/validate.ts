import { SyncDatatypeList } from "../common/types/SyncDatatypes";

const Joi = require('joi');

export const createSyncValidation = {
  options: {
    allowUnknownBody: false,
  },
  body: {
    data: {
      isOneTime: Joi.boolean().required(),
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
        selectedDatatypes: Joi.array().items(Joi.string().valid(SyncDatatypeList)).required(),
      }).required(),
      type: Joi.string().required(),
    }
  }
}