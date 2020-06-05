"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateQRCode = void 0;
const QRCode = require("qrcode");
const AppProviderTypes_1 = require("ow_common/lib/utils/AppProviderTypes");
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
    return QRCode.toDataURL(JSON.stringify(data))
        .then(url => AppProviderTypes_1.makeSuccess(url))
        .catch(err => AppProviderTypes_1.makeError(err.message));
}
exports.generateQRCode = generateQRCode;
//# sourceMappingURL=QRCode.js.map