
import * as Joi from 'react-native-joi';
import { Reading, PendingResource, ResourceScanResult } from '../typings/models/OurWater';
import { SomeResult, ResultType, ErrorResult, SuccessResult } from '../typings/AppProviderTypes';
import { ResourceType } from '../enums';
import { maybeLog } from '../utils';
import { AnyReading, GGMNReading, MyWellReading } from '../typings/models/Reading';
import { OrgType } from "../typings/models/OrgType";
import { ReadingImageType } from '../typings/models/ReadingImage';
import { string } from 'prop-types';
import { ReadingLocationType } from '../typings/models/ReadingLocation';

/* Make sure these match the fields in ../typings/models/Reading */

const GGMNReadingSchema = Joi.object().keys({
  type: Joi.string().equal(OrgType.GGMN).required(),
  resourceId: Joi.string().required(),
  timeseriesId: Joi.string().required(),
  date: Joi.string().isoDate().required(),
  value: Joi.number().required(),
});

const MyWellReadingSchema = {
  type: Joi.string().equal(OrgType.MYWELL).required(),
  resourceId: Joi.string().required(),
  timeseriesId: Joi.string().required(),
  date: Joi.string().isoDate().required(),
  value: Joi.number().required(),
  userId: Joi.string().required(),
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
}


export function validateReading(orgType: OrgType, reading: any): SomeResult<AnyReading> {
  console.log("Validating reading:", orgType, reading);
  switch (orgType) {
    case OrgType.GGMN: return validateReadingGGMN(reading);
    case OrgType.MYWELL: return validateReadingMyWell(reading);
  } 
}

function validateReadingGGMN(reading: GGMNReading): SomeResult<GGMNReading> {
  const schema: Joi.SchemaLike = GGMNReadingSchema;
  const result: Joi.ValidationResult<GGMNReading> = Joi.validate(reading, schema);
  if (result.error !== null) {
    return {
      type: ResultType.ERROR,
      message: result.error.message,
    };
  }

  const successResult: SuccessResult<GGMNReading> = {
    type: ResultType.SUCCESS,
    result: result.value,
  };
  
  return successResult
}

function validateReadingMyWell(reading: MyWellReading): SomeResult<MyWellReading> {
  const schema: Joi.SchemaLike = MyWellReadingSchema;
  const result: Joi.ValidationResult<MyWellReading> = Joi.validate(reading, schema);
  if (result.error !== null) {
    return {
      type: ResultType.ERROR,
      message: result.error.message,
    };
  }

  const successResult: SuccessResult<MyWellReading> = {
    type: ResultType.SUCCESS,
    result: result.value,
  };

  return successResult
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