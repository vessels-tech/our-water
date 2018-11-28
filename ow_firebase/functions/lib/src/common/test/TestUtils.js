"use strict";
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
//# sourceMappingURL=TestUtils.js.map