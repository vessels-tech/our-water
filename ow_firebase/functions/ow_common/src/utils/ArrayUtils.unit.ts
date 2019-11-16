import 'mocha';
import ArrayUtils from "./ArrayUtils";
import * as assert from 'assert';
import { Resource, DefaultMyWellResource } from '../model';



describe('Array Utils', function() {

  it('Merges two arrays of strings', () => {
    //Arrange
    const arr1 = ["abc", "def", "hij"];
    const arr2 = ["hij", "klm", "nop", "qrs"];

    //Act
    const result = ArrayUtils.mergeArrays(arr1, arr2, (s) => s);

    //Assert
    assert.strictEqual(result.length, 6);
  });


  it('Merges two arrays of resources', () => {
    //Arrange
    const arr1: Resource[] = [
      {...DefaultMyWellResource, id: "00001"},
      {...DefaultMyWellResource, id: "00002"},
      {...DefaultMyWellResource, id: "00003"},
    ];
    const arr2: Resource[] = [
      {...DefaultMyWellResource, id: "00001"},
      {...DefaultMyWellResource, id: "00002"},
      {...DefaultMyWellResource, id: "00003"},
      {...DefaultMyWellResource, id: "00004"},
      {...DefaultMyWellResource, id: "00005"},
    ];

    //Act
    const result = ArrayUtils.mergeArrays(arr1, arr2, (s) => s.id);

    //Assert
    assert.strictEqual(result.length, 5);
  });

});