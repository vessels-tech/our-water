import 'mocha';
import * as assert from 'assert';
//@ts-ignore
import MockFirestore from 'mock-cloud-firestore';
import { safeLower } from './Utils';


describe('Search Api', function () {
  this.timeout(5000);

  it('safeLower gets the lower number when undefined', () => {
    //Arrange
    const expected = 100;

    //Act
    const result = safeLower(undefined, 100);

    //Assert
    assert.equal(result, expected)
  });
});