"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSyncValidation = void 0;
const SyncDatatypes_1 = require("../../common/types/SyncDatatypes");
const SyncFrequency_1 = require("../../common/enums/SyncFrequency");
const Joi = require('joi');
exports.createSyncValidation = {
    options: {
        allowUnknownBody: false,
    },
    body: {
        data: {
            isOneTime: Joi.boolean().required(),
            frequency: Joi.string().valid(SyncFrequency_1.SyncFrequencyList).required(),
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
                selectedDatatypes: Joi.array().items(Joi.string().valid(SyncDatatypes_1.SyncDatatypeList)).required(),
            }).required(),
            type: Joi.string().required(),
        }
    }
};
//# sourceMappingURL=validate.js.map