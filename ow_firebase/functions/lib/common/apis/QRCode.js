"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const QRCode = require("qrcode");
const AppProviderTypes_1 = require("../types/AppProviderTypes");
/**
 * Generate a QR code given an orgId and id string
 *
 * @returns string: base64 encoded image
 */
function generateQRCode(orgId, id) {
    const data = {
        orgId,
        id,
        assetType: 'resource',
    };
    return QRCode.toDataURL('I am a pony!')
        .then(url => {
        return AppProviderTypes_1.makeSuccess(url);
    })
        .catch(err => {
        return AppProviderTypes_1.makeError(err.message);
    });
}
exports.generateQRCode = generateQRCode;
//# sourceMappingURL=QRCode.js.map