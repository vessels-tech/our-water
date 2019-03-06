import * as assert from 'assert';
import { validateDatatype } from './SyncDatatypes';
import 'mocha';

describe('SyncDatatype', function() {
  it('throws if the given datatype cannot be found', () => {
    //Act & Assert
    assert.throws(
      () => { validateDatatype('blablhaasd') },
      /^Error: Could not find*/
    );
  });

  it('finds the datatype', () => {
    validateDatatype('reading');
  });
});