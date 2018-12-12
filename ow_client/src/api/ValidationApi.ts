
import * as Joi from 'react-native-joi';
import { Reading, ResourceScanResult } from '../typings/models/OurWater';
import { SomeResult, ResultType, ErrorResult, SuccessResult, makeError, makeSuccess } from '../typings/AppProviderTypes';
import { ResourceType } from '../enums';
import { maybeLog } from '../utils';
import { AnyReading, GGMNReading, MyWellReading } from '../typings/models/Reading';
import { OrgType } from "../typings/models/OrgType";
import { ReadingImageType } from '../typings/models/ReadingImage';
import { string } from 'prop-types';
import { ReadingLocationType } from '../typings/models/ReadingLocation';
import { PendingResource } from '../typings/models/PendingResource';
import { PendingReading } from '../typings/models/PendingReading';


const PendingReadingSchema = {
  id: Joi.string(), //Id will probably be undefined
  pending: Joi.boolean().required(),
  resourceId: Joi.string().required(),
  timeseriesId: Joi.string().required(),
  date: Joi.string().isoDate().required(),
  value: Joi.number().required(),
  image: Joi.allow([
    Joi.object().keys({
      type: Joi.string().equal(ReadingImageType.NONE)
    }),
    Joi.object().keys({
      type: Joi.string().equal(ReadingImageType.IMAGE),
      url: Joi.string().required()
    })
  ]).required(),
  location: Joi.allow([
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
  ]).required(),
  groundwaterStationId: Joi.any(),
}


export function validateReading(orgType: OrgType, reading: any): SomeResult<PendingReading> {
  const schema: Joi.SchemaLike = PendingReadingSchema;
  const options = {
    stripUnknown: true,
  };

  const result: Joi.ValidationResult<PendingReading> = Joi.validate(reading, schema, options);
  if (result.error !== null) {
    return makeError(result.error.message);
  }

  return makeSuccess<PendingReading>(result.value); 
}

/**
 * Validate the resource from the form.
 * We use this method as joi lets us be more specific than Typescript
 * Plus it also converts values for us.
 */
export function validateResource(resource: any): SomeResult<PendingResource> {
  const schema: Joi.SchemaLike = Joi.object().keys({
    id: Joi.string(),
    name: Joi.string(),
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
      unitOfMeasure: Joi.string().allow('m', 'mm', 'ppm'),
    })).required(),
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



/**
 * Validate a scan result from the QR code scanner
 * 
 */
export function validateScanResult(scanResult: any, orgId: string): SomeResult<ResourceScanResult> {
  const schema: Joi.SchemaLike = Joi.object().keys({
    orgId: Joi.string().valid(orgId),
    assetType: Joi.string().valid('resource'),
    id: Joi.string(),
  });

  const result = Joi.validate(scanResult, schema);
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