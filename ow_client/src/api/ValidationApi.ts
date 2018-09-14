
import * as Joi from 'react-native-joi';
import { Reading } from '../typings/models/OurWater';
import { SomeResult, ResultType, ErrorResult, SuccessResult } from '../typings/AppProviderTypes';

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
      console.log('error', result.error);
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