import 'text-encoding';
import * as Joi from '@hapi/joi';
import { ResourceScanResult } from '../typings/models/OurWater';
import { SomeResult, ResultType, makeError, makeSuccess } from '../typings/AppProviderTypes';
import { ResourceType } from '../enums';
import { maybeLog } from '../utils';
import { OrgType } from "../typings/models/OrgType";
import { ReadingImageType } from '../typings/models/ReadingImage';
import { ReadingLocationType } from '../typings/models/ReadingLocation';
import { PendingResource } from '../typings/models/PendingResource';
import { PendingReading } from '../typings/models/PendingReading';

const PendingReadingSchema = Joi.object({
  id: Joi.string(), //Id will probably be undefined
  pending: Joi.boolean().required(),
  resourceId: Joi.string().required(),
  timeseriesId: Joi.string().required(),
  date: Joi.string().isoDate().required(),
  
  //Hacks while we wait to fix the type issue
  datetime: Joi.string().isoDate().required(),
  resourceType: Joi.string().required(),

  value: Joi.number().required(),
  image: Joi.allow(
    Joi.object().keys({
      type: Joi.string().equal(ReadingImageType.NONE)
    }),
    Joi.object().keys({
      type: Joi.string().equal(ReadingImageType.IMAGE),
      url: Joi.string().required()
    })
  ).required(),
  location: Joi.allow(
    Joi.object().keys({
      type: Joi.string().equal(ReadingLocationType.NONE)
    }),
    Joi.object().keys({
      type: Joi.string().equal(ReadingLocationType.LOCATION),
      location: Joi.object().keys({
        _latitude: Joi.number().required(),
        _longitude: Joi.number().required(),
      })
    })
  ).required(),
  groundwaterStationId: Joi.any(),
  isResourcePending: Joi.boolean().required(),
});


export function validateReading(orgType: OrgType, reading: any): SomeResult<PendingReading> {
  const schema: Joi.Schema = PendingReadingSchema;
  const options = {
    stripUnknown: true,
  };

  const result: Joi.ValidationResult = schema.validate(reading, options);
  if (typeof result.error !== 'undefined') {
    return makeError(result.error.message);
  }

  return makeSuccess<PendingReading>(result.value); 
}

/**
 * Validate the resource from the form.
 * We use this method as joi lets us be more specific than Typescript
 * Plus it also converts values for us.
 * 
 * https://github.com/hapijs/joi/blob/v14.3.1/API.md
 */
export function validateResource(resource: any): SomeResult<PendingResource> {
  const schema: Joi.Schema = Joi.object().keys({
    id: Joi.string(),
    name: Joi.string(),
    pending: Joi.boolean().allow(true).required(),
    coords: Joi.object().keys({
      latitude: Joi.number(),
      longitude: Joi.number(),
    }).required(),
    //TODO: make one of ResourceType
    resourceType: Joi.valid.apply(Joi, Object.keys(ResourceType)).required(),
    owner: Joi.object().keys({
      name: Joi.string().required(),
      createdByUserId: Joi.string().optional(),
    }).required(),
    userId: Joi.string().required(),
    timeseries: Joi.array().items(Joi.object().keys({
      name: Joi.string().required(),
      parameter: Joi.string().required(),
      //This may change in the future if we allow users to create resources with readings already
      readings: Joi.array().empty().required(),
      unitOfMeasure: Joi.string().required(),
    })).required(),
    waterColumnHeight: Joi.number(),
    groups: Joi.object().required(),
    locationName: Joi.string().required(),
    image: Joi.string().allow('')
  });

  const result = schema.validate(resource);

  if (typeof result.error !== 'undefined') {
    maybeLog("validation error: " + result.error);
    return makeError(result.error.message);
  }

  return makeSuccess(result.value);
}



/**
 * Validate a scan result from the QR code scanner
 * 
 */
export function validateScanResult(scanResult: any, orgId: string): SomeResult<ResourceScanResult> {
  const schema: Joi.Schema = Joi.object().keys({
    orgId: Joi.string().valid(orgId),
    assetType: Joi.string().valid('resource'),
    id: Joi.string(),
  });

  const result = schema.validate(scanResult);
  if (result.error) {
    maybeLog('validateScanResult error: ', result.error);
    return {
      type: ResultType.ERROR,
      message: result.error.message,
    }
  }

  return {
    type: ResultType.SUCCESS,
    result: result.value,
  };
}