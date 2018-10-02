
import * as Joi from 'react-native-joi';
import { Reading, PendingResource, Resource } from '../typings/models/OurWater';
import { SomeResult, ResultType, ErrorResult, SuccessResult } from '../typings/AppProviderTypes';
import { ResourceType } from '../enums';
import { maybeLog } from '../utils';

export function validateReading(reading: any): Promise<SomeResult<Reading>> {
  const schema:Joi.SchemaLike = Joi.object().keys({
    date: Joi.string().isoDate().required(),
    value: Joi.number().required(),
    userId: Joi.string().required(),
    resourceId: Joi.string().required(),
    isLegacy: Joi.boolean().default(false),
    coords: Joi.object().keys({
      latitude: Joi.number(),
      longitude: Joi.number(),
    }),
    imageUrl: Joi.string().uri(),
    timeseriesId: Joi.string(),
  });

  //TODO: not sure why this is like this...
  return new Promise((resolve, reject) => {
    const result = Joi.validate(reading, schema);
    
    if (result.error !== null) {
      const errorResult: ErrorResult = {
        type: ResultType.ERROR,
        message: result.error.message,
      };

      return reject(errorResult);
    }

    const successResult: SuccessResult<Reading> = {
      type: ResultType.SUCCESS,
      result: result.value,
    };
    resolve(successResult);
  });
}


/**
 * Validate the resource from the form.
 * We use this method as joi lets us be more specific than Typescript
 * Plus it also converts values for us.
 */
export function validateResource(resource: any): SomeResult<PendingResource> {
  const schema: Joi.SchemaLike = Joi.object().keys({
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
  });

  const result = Joi.validate(resource, schema);

  if (result.error !== null) {
    maybeLog("validation error: " + result.error);
    return {
      type: ResultType.ERROR,
      message: result.error.message,
    };
  }

  return {
    type: ResultType.SUCCESS,
    result: result.value,
  }
}