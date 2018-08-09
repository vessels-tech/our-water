import * as assert from 'assert';
import * as chai from 'chai';
import ResourceIdType from "./ResourceIdType";

import fs from '../apis/Firestore';
import { access } from 'fs';
import { isNullOrUndefined } from 'util';


describe('ResourceIdTypeTest', function () {

  describe('static initializers', () => {
    it('fromLegacyPincode fills in only MyWellId and pincode', () => {
      //Arrange
      const legacyId = ResourceIdType.fromLegacyPincode(313603);

      //Act
      const ser = legacyId.serialize();

      //Assert
      chai.assert.isNotNull(ser.legacyMyWellId);
      chai.assert.isNotNull(ser.legacyMyWellPincode);
      chai.assert.isTrue(ser.hasLegacyMyWellId);
      chai.assert.isTrue(ser.hasLegacyMyWellPincode);
    });

    it('fromLegacyVillageId fills in MyWellId, Pincode and VillageIds', () => {
      //Arrange
      const legacyId = ResourceIdType.fromLegacyVillageId(313603, 11);

      //Act
      const ser = legacyId.serialize();

      //Assert
      chai.assert.isNotNull(ser.legacyMyWellId);
      chai.assert.isNotNull(ser.legacyMyWellPincode);
      chai.assert.isNotNull(ser.legacyMyWellVillageId);
      chai.assert.isTrue(ser.hasLegacyMyWellId);
      chai.assert.isTrue(ser.hasLegacyMyWellPincode);
      chai.assert.isTrue(ser.hasLegacyMyWellVillageId);
    });

    it('fromLegacyMyWellId fills in MyWellId, Pincode, Village and ResourceIds', () => {
      //Arrange
      const legacyId = ResourceIdType.fromLegacyMyWellId(313603, 1111);

      //Act
      const ser = legacyId.serialize();

      //Assert
      const expected = {
        legacyMyWellId: '313603.1111',
        legacyMyWellPincode: '313603',
        legacyMyWellVillageId: '11',
        legacyMyWellResourceId: '1111',
        hasLegacyMyWellId: true,
        hasLegacyMyWellResourceId: true,
        hasLegacyMyWellVillageId: true,
        hasLegacyMyWellPincode: true,
      };
      assert.deepEqual(ser, expected);
    });

    it('fromLegacyReadingId fills in MyWellId, Pincode, Village and ResourceIds', () => {
      //Arrange
      const legacyId = ResourceIdType.fromLegacyReadingId(12345, 313603, 1111);

      //Act
      const ser = legacyId.serialize();

      //Assert
      const expected = {
        legacyMyWellId: '12345',
        legacyMyWellPincode: '313603',
        legacyMyWellVillageId: '11',
        legacyMyWellResourceId: '1111',
        hasLegacyMyWellId: true,
        hasLegacyMyWellResourceId: true,
        hasLegacyMyWellVillageId: true,
        hasLegacyMyWellPincode: true,
      };
      assert.deepEqual(ser, expected);
    });
  });

  describe('serialize()', () => {

    it('does not have extra null fields', () => {
      //Arrange
      const legacyId = ResourceIdType.fromLegacyPincode(313603);

      //Act
      const ser = legacyId.serialize();

      //Assert
      const nullCount = Object.keys(ser).map(key => ser[key]).reduce((acc, curr) => {
        if (isNullOrUndefined(curr)) {
          acc += 1;
        }
        return acc;
      }, 0);
      assert.equal(nullCount, 0);
    });

    it('adds extra `has` fields', () => {
      //Arrange
      const legacyId = ResourceIdType.fromLegacyVillageId(313603, 11);

      //Act
      const ser = legacyId.serialize()

      //Assert
      const expected = {
        legacyMyWellId: '313603.11',
        legacyMyWellPincode: '313603',
        legacyMyWellVillageId: '11',
        hasLegacyMyWellId: true,
        hasLegacyMyWellResourceId: false,
        hasLegacyMyWellVillageId: true,
        hasLegacyMyWellPincode: true,
      };
      assert.deepEqual(expected, ser);
    });

  });

  describe('getResourceId()', () => {
    it('throws when no legacyMyWellResourceId', () => {
      //Arrange
      const resourceId = ResourceIdType.fromLegacyPincode(5000);

      //Act & Assert
      assert.throws(
        () => { resourceId.getResourceId() },
        /^Error: tried to getResourceId*/
      );
    });

    it('returns the correct villageId', () => {
      //Arrange
      const resource = ResourceIdType.fromLegacyReadingId(12345, 5000, 1123);

      //Act
      const resourceId = resource.getResourceId();

      //Assert
      assert.equal(resourceId, 1123);
    });
  });

  describe('getVillageId()', () => {
    /*no longer relevant, as we must have a postcode */
    it('throws when no legacyMyWellResourceId', () => {
      //Arrange
      const resourceId = ResourceIdType.fromLegacyPincode(5000);

      //Act & Assert
      assert.throws(
        () => { resourceId.getVillageId() },
        /^Error: tried to getVillageId*/
      );
    });

    it('returns the correct villageId', () => {
      //Arrange
      const resourceId = ResourceIdType.fromLegacyReadingId(12345, 5000, 1123);

      //Act
      const villageId = resourceId.getVillageId();

      //Assert
      assert.equal(villageId, 11);
    });
  });

  describe('getPostcode', function () {
    it('returns the correct postcode', () => {
      //Arrange
      const resourceId = ResourceIdType.fromLegacyReadingId(12345, 5000, 1123);

      //Act
      const postcode = resourceId.getPostcode();

      //Assert
      assert.equal(postcode, 5000);
    });
  });
});
