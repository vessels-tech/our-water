import * as assert from 'assert';
import * as mocha from 'mocha';

import { generateQRCode } from './QRCode';
import { ResultType } from 'ow_common/lib/utils/AppProviderTypes';

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
});