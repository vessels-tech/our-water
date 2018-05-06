// import * as Joi from 'joi';

const Joi = require('joi');


export enum SyncMethod {
  validate = 'validate',
  pushTo = 'pushTo',
  pullFrom = 'pullFrom',

  // to be implemented later:
  get = 'get',
  post = 'post',
}

const SyncMethodValidation = Joi.valid(
  SyncMethod.validate,
  SyncMethod.pushTo,
  SyncMethod.pullFrom
);

export { SyncMethodValidation };