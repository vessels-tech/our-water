import * as assert from 'assert';
import * as mocha from 'mocha';

import { generateQRCode } from './QRCode';
import { ResultType } from '../types/AppProviderTypes';

describe('QRCode', function () {

  it.only('generates the QR code', async () => {
    //Arrange
    
    //Act
    const qrResult = await generateQRCode('mywell', '12345');
    console.log(qrResult);

    //Assert  
    if (qrResult.type !== ResultType.SUCCESS) {
      throw new Error(qrResult.message);
    }

    //TODO:
    assert.equal(qrResult.result, '12345');
  });
});