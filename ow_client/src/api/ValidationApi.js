
import Joi from 'react-native-joi';

const validateReading = (reading) => {
  const schema = Joi.object().keys({
    datetime: Joi.string().isoDate().required(),
    value: Joi.number().required(),
    userId: Joi.string().required(),
    resourceId: Joi.string().required(),
    isLegacy: Joi.boolean().default(false),
  });

  return new Promise((resolve, reject) => {
    const result = Joi.validate(reading, schema);
    
    if (result.error !== null) {
      console.log('error', result.error);
      return reject(result.error);
    }

    resolve(result.value);
  });
}

export {
  validateReading,
}