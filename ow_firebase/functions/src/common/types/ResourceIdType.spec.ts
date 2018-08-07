import ResourceIdType from "./ResourceIdType";

const assert = require('assert');

describe('ResourceIdTypeTest', function () {
  describe('getResourceId()', () => {
    it('throws when no legacyMyWellResourceId', () => {
      //Arrange
      const resourceId = ResourceIdType.fromLegacyMyWellId(5000, 1123);

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
    it('throws when no legacyMyWellResourceId', () => {
      //Arrange
      const resourceId = ResourceIdType.fromLegacyMyWellId(5000, 1123);

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
    it('throws with no legacyMyWellResourceId', () => {
      //Arrange
      const resourceId = ResourceIdType.fromLegacyMyWellId(5000, 1123);

      //Act & Assert
      assert.throws(
        () => { resourceId.getPostcode() },
        /^Error: tried to getPostcode*/
      );
    });

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
