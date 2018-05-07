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
const moment = require("moment");
// const moment = require('moment');
const SyncRunStatus_1 = require("../enums/SyncRunStatus");
const SyncMethod_1 = require("../enums/SyncMethod");
const Sync_1 = require("./Sync");
/**
 * A Sync run is a single run of a single sync method.
 * When a sync is triggered, a run is created.
 *
 * Runs start in a `pending` state, when it is running, it will move
 * to a `running` status,  and then move to `error` or `success`
 * SyncRuns will eventually have subscribers which are notified
 * when a run fails or succeeds for any reason.
 *
 * For now, we will just log to console when this happens
 *
 */
class SyncRun {
    //TODO: constructor or builder
    constructor(orgId, syncId, syncMethod, subscribers) {
        this.startedAt = 0; //unix timestamp
        this.finishedAt = 0; //unix timestamp
        this.status = SyncRunStatus_1.SyncRunStatus.pending;
        this.results = [];
        this.errors = [];
        this.orgId = orgId;
        this.syncId = syncId;
        this.syncMethod = syncMethod;
        this.subscribers = subscribers;
    }
    /**
     * Run the syncRun
     * @param param0
     */
    run({ fs }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.status !== SyncRunStatus_1.SyncRunStatus.pending) {
                throw new Error(`SyncRun can only be run when in a pending state. Found state: ${this.status}`);
            }
            this.startedAt = moment().unix();
            this.status = SyncRunStatus_1.SyncRunStatus.running;
            const sync = yield Sync_1.Sync.getSync({ orgId: this.orgId, id: this.syncId, fs });
            if (!sync) {
                this.errors.push(`Could not find sync with SyncId: ${this.syncId}`);
                return this.abortSync({ fs });
            }
            //set the state to running
            yield this.save({ fs });
            switch (this.syncMethod) {
                //call the datasource methods, but don't commit anything to the database
                case SyncMethod_1.SyncMethod.validate:
                    try {
                        const result = yield sync.datasource.pullDataFromDataSource();
                        this.results.push(result);
                    }
                    catch (error) {
                        console.log('error', error);
                        this.errors.push(error);
                    }
                    try {
                        const result = yield sync.datasource.pushDataToDataSource();
                        this.results.push(result);
                    }
                    catch (error) {
                        console.log('error', error);
                        this.errors.push(error);
                    }
                    break;
                //Pull from the external datasource, and save to db
                case SyncMethod_1.SyncMethod.pullFrom:
                    try {
                        //TODO: first get some data to push...
                        const result = yield sync.datasource.pullDataFromDataSource();
                        //TODO: do something with this result
                        this.results.push(result);
                    }
                    catch (error) {
                        console.log('error', error);
                        this.errors.push(error);
                    }
                    break;
                //Get data from somewhere, and push to external datasource
                case SyncMethod_1.SyncMethod.pushTo:
                    try {
                        //TODO: first get some data to push...
                        const result = yield sync.datasource.pushDataToDataSource();
                        this.results.push(result);
                    }
                    catch (error) {
                        console.log('error', error);
                        this.errors.push(error);
                    }
                    break;
                default:
                    console.error("Other SyncMethods not implemented yet.");
            }
            //TODO: we need to somehow update the Sync with the last sync date,
            //But I think that we need to keep track of separate dates depending on the
            //method used. We will leave that for later.
            if (this.errors.length > 0) {
                return this.abortSync;
            }
            return this.finishSync({ fs });
        });
    }
    abortSync({ fs }) {
        return __awaiter(this, void 0, void 0, function* () {
            this.status = SyncRunStatus_1.SyncRunStatus.failed;
            this.finishedAt = moment().unix();
            return this.save({ fs });
        });
    }
    finishSync({ fs }) {
        return __awaiter(this, void 0, void 0, function* () {
            this.status = SyncRunStatus_1.SyncRunStatus.finished;
            this.finishedAt = moment().unix();
            return this.save({ fs });
        });
    }
    /**
     * Create a new SyncRun in FireStore
     */
    create({ fs }) {
        const newSyncRef = fs.collection('org').doc(this.orgId).collection('syncRun').doc();
        this.id = newSyncRef.id;
        return this.save({ fs });
    }
    save({ fs }) {
        //TODO: do we want this to merge?
        return fs.collection('org').doc(this.orgId).collection('syncRun').doc(this.id).set(this.serialize())
            .then(ref => {
            return this;
        });
    }
    serialize() {
        return {
            id: this.id,
            orgId: this.orgId,
            syncId: this.syncId,
            syncMethod: this.syncMethod.toString(),
            subscribers: this.subscribers,
            startedAt: new Date(this.startedAt),
            finishedAt: new Date(this.finishedAt),
            status: this.status.toString(),
            results: this.results,
            errors: this.errors,
        };
    }
    /**
     * Get the sync run for the given id
     * @param param0
     */
    static getSyncRun({ orgId, id, fs }) {
        return fs.collection('org').doc(orgId).collection('syncRun').doc(id);
        //TODO: deserialize into actual SyncRun object
    }
}
exports.SyncRun = SyncRun;
//# sourceMappingURL=SyncRun.js.map