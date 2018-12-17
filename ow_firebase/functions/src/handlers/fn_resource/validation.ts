import { ResourceType } from "../../common/enums/ResourceType";

const Joi = require('joi');

const pendingResourceValidation = Joi.object().keys({
  id: Joi.string(),
  pending: Joi.boolean().allow(true).required(),
  coords: Joi.object().keys({
    latitude: Joi.number(),
    longitude: Joi.number(),
  }).required(),
  //TODO: make one of ResourceType
  resourceType: Joi.valid(Object.keys(ResourceType)).required(),
  owner: Joi.object().keys({
    name: Joi.string().required(),
  }).required(),
  userId: Joi.string().required(),
  timeseries: Joi.array().items(Joi.object().keys({
    name: Joi.string().required(),
    parameter: Joi.string().required(),
    //This may change in the future if we allow users to create resources with readings already
    readings: Joi.array().empty().required(),
  })).required(),
  waterColumnHeight: Joi.number(),
});

//DON'T USE THIS ELSEWHERE!
const pendingReadingValidation = Joi.object().keys({
  // type: Joi.string().required(),
  // id: Joi.string().required(),
  pending: Joi.boolean().allow(true).required(),
  resourceId: Joi.string().required(),
  timeseriesId: Joi.string().required(),
  value: Joi.number().required(),
  date: Joi.string().isoDate(),
});

export const ggmnResourceEmailValidation = {
  options: {
    allowUnknownBody: true,
  },
  body: {
    email: Joi.string().email().required(),
    subject: Joi.string().required(),
    message: Joi.string().required(),
    pendingResources: Joi.array().min(0).items(pendingResourceValidation).required(),
    pendingReadings: Joi.array().min(0).items(pendingReadingValidation).required(),
  } 
}


