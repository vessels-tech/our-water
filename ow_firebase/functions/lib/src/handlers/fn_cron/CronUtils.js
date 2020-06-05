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
const utils_1 = require("../../common/utils");
const AppProviderTypes_1 = require("ow_common/lib/utils/AppProviderTypes");
const api_1 = require("ow_common/lib/api");
const env_1 = require("../../common/env");
const EmailApi_1 = require("../../common/apis/EmailApi");
// import { Firestore } from '@google-cloud/firestore';
const request = require('request-promise-native');
class CronUtils {
    /**
     * @function SendDailyEmail
     * @description Sends a daily digest email to an admin's email address
     *   For now, this is just a list of the new sign ups from yesterday
     */
    // TODO: Integration test!
    static sendDailyEmail(fs, orgId) {
        return __awaiter(this, void 0, void 0, function* () {
            /* Lookup org/mywell metadata.lastSignUps for a list of user ids*/
            const mywellDoc = yield fs.collection('org').doc(orgId).get();
            const { metadata: { newSignUps } } = mywellDoc.data();
            if (!newSignUps) {
                throw new Error('newSignUps is null or undefined');
            }
            const userIds = Object.keys(newSignUps);
            /* For each id in new signups, lookup the user in our database */
            const userApi = new api_1.UserApi(fs, 'mywell');
            const users = yield Promise.all(userIds.map((userId) => __awaiter(this, void 0, void 0, function* () { return AppProviderTypes_1.unsafeUnwrap(yield userApi.getUser(userApi.userRef(orgId, userId))); })));
            const sendResults = yield Promise.all(env_1.digestEmailDestination.map(email => EmailApi_1.default.sendUserDigestEmail(email, users)));
            console.log("Send results is", sendResults);
            /* Clear the New user's metadata */
            yield fs.collection('org').doc('mywell').set({ metadata: {} }, { merge: false });
        });
    }
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
            .then(() => AppProviderTypes_1.makeSuccess(undefined))
            .catch((err) => AppProviderTypes_1.makeError(err.message));
    }
    /**
     * Search firebase storage for backups that should be deleted
     * Note: not currently working
     */
    static getBackupsToExpire(storage, accessToken, backupDate) {
        return __awaiter(this, void 0, void 0, function* () {
            //format is: gs://${backupBucketName}/2019-01-12T04:55:04_75044/
            // const bucket = storage.bucket(`gs://${backupBucketName}`);
            const bucket = storage.bucket(`our-water-dev`);
            console.log("bucketname is", env_1.backupBucketName);
            // console.log("bucket is", bucket);
            const filesResult = yield bucket.getFiles();
            console.log("filesResult", filesResult);
            return null;
        });
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