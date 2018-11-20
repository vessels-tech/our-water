"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../../common/utils");
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
}
exports.default = CronUtils;
//# sourceMappingURL=CronUtils.js.map