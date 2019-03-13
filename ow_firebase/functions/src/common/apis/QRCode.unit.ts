import * as assert from 'assert';
import * as mocha from 'mocha';

import { generateQRCode, getWholeQR } from './QRCode';
import { ResultType, unsafeUnwrap } from 'ow_common/lib/utils/AppProviderTypes';
const fs = require('fs');

describe('QRCode', function () {

  it('generates the QR code', async () => {
    //Arrange
    
    //Act
    const qrResult = await generateQRCode('mywell', '12345');

    //Assert  
    if (qrResult.type !== ResultType.SUCCESS) {
      throw new Error(qrResult.message);
    }
    assert.notEqual(qrResult.result.indexOf('data:image/png;base64'), -1);
  });


  it("generates the whole image", async () => {
    //Arrange

    //Act
    const result = unsafeUnwrap(await getWholeQR("mywell", "100-001", "LONGGGG ID"));

    //Assert
    //returns a Buffer
    fs.writeFileSync('/tmp/foo1.png', result);
  });
});
