const Joi = require('joi');

export const validation = {
  query: {
    name: Joi.string().required(),
  }
};