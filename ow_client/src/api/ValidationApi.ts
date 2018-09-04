
import * as Joi from 'react-native-joi';
import { Reading } from '../typings/models/OurWater';

export function validateReading(reading: any): Promise<Reading> {
  const schema:Joi.SchemaLike = Joi.object().keys({
    datetime: Joi.string().isoDate().required(),
    value: Joi.number().required(),
    userId: Joi.string().required(),
    resourceId: Joi.string().required(),
    isLegacy: Joi.boolean().default(false),
    coords: Joi.object().keys({
      latitude: Joi.number(),
      longitude: Joi.number(),
    }),
    imageUrl: Joi.string().uri(),
  });

  //TODO: not sure why this is like this...
  return new Promise((resolve, reject) => {
    const result = Joi.validate(reading, schema);
    
    if (result.error !== null) {
      console.log('error', result.error);
      return reject(result.error);
    }

    resolve(result.value);
  });
}