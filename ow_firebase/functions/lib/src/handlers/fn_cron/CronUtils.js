"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../../common/utils");
const AppProviderTypes_1 = require("ow_common/lib/utils/AppProviderTypes");
const dep_AppProviderTypes_1 = require("../../common/types/dep_AppProviderTypes");
const env_1 = require("../../common/env");
const request = require('request-promise-native');
class CronUtils {
    /**
     * Get the eligible syncs
     */
    static getSyncsForFrequency(orgId, fs, frequency) {
        return fs.collection('org').document(orgId).collection('sync')
            .where('frequency', '==', frequency)
            .where('isOneTime', '==', false)
            .get()
            .then(sn => utils_1.snapshotToSyncList(sn));
    }
    /**
     * Run a sync
     */
    static triggerSync(sync) {
        return null;
    }
    /**
     * Perform the database backup
     */
    static backupDatabase(accessToken) {
        console.log("Performing Cloud Firestore Backup");
        // reference: https://firebase.google.com/docs/firestore/manage-data/export-import
        const url = `https://firestore.googleapis.com/v1beta1/projects/our-water/databases/(default):exportDocuments`;
        const options = {
            headers: {
                Authorization: `Bearer ${accessToken}`
            },
            json: true,
            body: {
                outputUriPrefix: `gs://${env_1.backupBucketName}`,
            }
        };
        return request.post(url, options)
            .then(() => dep_AppProviderTypes_1.makeSuccess(undefined))
            .catch((err) => AppProviderTypes_1.makeError(err.message));
    }
    /**
     * Search firebase storage for backups that should be deleted
     */
    static getBackupsToExpire(accessToken, backupDate) {
        //format is: gs://${backupBucketName}/2019-01-12T04:55:04_75044/
        return null;
    }
    /**
     * Expire old backups
     */
    static deleteBackup(path) {
        console.log("expiring Cloud Firestore Backup", path);
        return null;
    }
}
exports.default = CronUtils;
//# sourceMappingURL=CronUtils.js.map