import * as QRCode from 'qrcode';
import { SomeResult, makeSuccess, makeError } from '../types/AppProviderTypes';
 

/**
 * Generate a QR code given an orgId and id string
 * 
 * @returns string: base64 encoded image
 */
export function generateQRCode(orgId: string, id: string): Promise<SomeResult<string>> {
  const data = {
    orgId,
    id,
    assetType: 'resource',
  };

  return QRCode.toDataURL(JSON.stringify(data))
  .then(url => makeSuccess(url))
  .catch(err => makeError(err.message));
}

