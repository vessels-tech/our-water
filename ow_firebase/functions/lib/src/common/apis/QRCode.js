"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const QRCode = require("qrcode");
const AppProviderTypes_1 = require("ow_common/lib/utils/AppProviderTypes");
const jsdom = require("jsdom");
const svg2img = require('svg2img');
const { JSDOM } = jsdom;
const fs = require('fs');
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
    //TODO: add some other text, eg. the shortId and orgId: mywell
    return QRCode.toDataURL(JSON.stringify(data))
        .then(url => AppProviderTypes_1.makeSuccess(url))
        .catch(err => AppProviderTypes_1.makeError(err.message));
}
exports.generateQRCode = generateQRCode;
/**
 * Generate a base 64 encoded png with orgId and shortId text,
 * containing a QR Code with the logo overlayed
 *
 * @returns string: base64 encoded image
 */
function getWholeQR(orgId, shortId, longId) {
    return __awaiter(this, void 0, void 0, function* () {
        const qrCodeResult = yield generateQRCode(orgId, longId);
        if (qrCodeResult.type === AppProviderTypes_1.ResultType.ERROR) {
            return qrCodeResult;
        }
        const base64QR = qrCodeResult.result;
        const svgString = `<svg width="684px" height="864px" viewBox="0 0 342 432" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <rect id="Rectangle" stroke="#111111" stroke-width="5" fill="#FFFFFF" fill-rule="nonzero" x="2.5" y="2.5" width="337" height="427"></rect>

        <text id="ID:-&lt;id&gt;" font-family="AvenirNext-Medium, Avenir Next" font-size="38" font-weight="400" fill="#202020">
            <tspan x="28" y="64">ID: ${shortId}</tspan>
        </text>
        <text id="Org:-&lt;org&gt;" font-family="AvenirNext-Medium, Avenir Next" font-size="38" font-weight="400" fill="#202020">
            <tspan x="28" y="112">Org: ${orgId}</tspan>
        </text>
        <image id="qr_code" x="28" y="150" width="288" height="260" xlink:href="${base64QR}"></image>
        <rect id="Rectangle" fill="#FFFFFF" fill-rule="nonzero" x="146" y="255" width="50" height="50"></rect>
        <image id="logo" x="147" y="256" width="48" height="48" xlink:href="data:image/png;base64,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"></image>
      </g>
    </svg>`;
        return new Promise((resolve, reject) => {
            //1. convert from svg string
            svg2img(svgString, function (error, buffer) {
                if (error) {
                    resolve(AppProviderTypes_1.makeError(error));
                    return;
                }
                resolve(AppProviderTypes_1.makeSuccess(buffer));
            });
        });
    });
}
exports.getWholeQR = getWholeQR;
//# sourceMappingURL=QRCode.js.map