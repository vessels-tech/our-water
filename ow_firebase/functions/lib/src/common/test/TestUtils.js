"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const request = require('request-promise-native');
const baseUrl = process.env.BASE_URL;
const orgId = process.env.ORG_ID;
const mywellLegacyBaseUrl = process.env.MYWELL_LEGACY_BASE_URL;
exports.createNewSync = () => {
    const data = {
        isOneTime: false,
        datasource: {
            type: "LegacyMyWellDatasource",
            url: mywellLegacyBaseUrl,
        },
        type: "unknown",
        selectedDatatypes: [
            'group',
            'resource',
            'reading',
        ]
    };
    const options = {
        method: 'POST',
        uri: `${baseUrl}/sync/${orgId}`,
        json: true,
        body: {
            data
        }
    };
    return request(options)
        .then(response => {
        console.log("createNewSync response, ", response);
        return response.data.syncId;
    })
        .catch(err => {
        console.log('err', err);
        return Promise.reject(err);
    });
};
exports.getSyncRun = (_orgId, fs, syncRunId) => {
    return fs.collection('org').doc(_orgId).collection('syncRun').doc(syncRunId).get()
        .then(sn => sn.data());
};
/**
 * Get all of the resources.
 *
 * Shouldn't be used in production as it is wildly inefficent
 */
function getAllResources(fbApi) {
    return __awaiter(this, void 0, void 0, function* () {
        return fbApi.resourceCol(orgId).get()
            .then(sn => {
            const resources = [];
            sn.forEach(doc => resources.push(doc.data()));
            return resources;
        });
    });
}
exports.getAllResources = getAllResources;
/**
 * Get all of the readings.
 *
 * Shouldn't be used in production as it is wildly inefficent
 */
function getAllReadings(fbApi) {
    return __awaiter(this, void 0, void 0, function* () {
        return fbApi.readingCol(orgId).get()
            .then(sn => {
            const readings = [];
            sn.forEach(doc => readings.push(doc.data()));
            return readings;
        });
    });
}
exports.getAllReadings = getAllReadings;
//# sourceMappingURL=TestUtils.js.map