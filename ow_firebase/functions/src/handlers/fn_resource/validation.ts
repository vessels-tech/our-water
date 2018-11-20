import { ResourceType } from "../common/enums/ResourceType";

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
});

export const ggmnResourceEmailValidation = {
  options: {
    allowUnknownBody: true,
  },
  body: {
      email: Joi.string().email().required(),
      pendingResources: Joi.array().min(1).items(pendingResourceValidation).required(),
  } 
}


