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
        this.warnings = [];
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
            this.startedAt = moment().valueOf();
            console.log("startedAt", this.startedAt);
            this.status = SyncRunStatus_1.SyncRunStatus.running;
            const sync = yield Sync_1.Sync.getSync({ orgId: this.orgId, id: this.syncId, fs });
            console.log("running sync:", sync);
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
                        //TODO: change this to use the a validate method instead
                        const result = yield sync.datasource.validate(this.orgId, fs);
                        this.results = result.results;
                        this.warnings = result.warnings;
                        console.log("result is: ", result);
                    }
                    catch (error) {
                        console.log('error', error);
                        this.errors.push(error.message);
                    }
                    break;
                //Pull from the external datasource, and save to db
                case SyncMethod_1.SyncMethod.pullFrom:
                    try {
                        //TODO: first get some data to push...
                        const result = yield sync.datasource.pullDataFromDataSource(this.orgId, fs);
                        //TODO: do something with this result
                        this.results = result.results;
                    }
                    catch (error) {
                        console.log('error', error);
                        this.errors.push(error.message);
                    }
                    break;
                //Get data from somewhere, and push to external datasource
                case SyncMethod_1.SyncMethod.pushTo:
                    try {
                        //TODO: first get some data to push...
                        const result = yield sync.datasource.pushDataToDataSource();
                        this.results = result.results;
                    }
                    catch (error) {
                        console.log('error', error);
                        this.errors.push(error.message);
                    }
                    break;
                default:
                    console.error("Other SyncMethods not implemented yet.");
            }
            //TODO: we need to somehow update the Sync with the last sync date,
            //But I think that we need to keep track of separate dates depending on the
            //method used. We will leave that for later.
            if (this.errors.length > 0) {
                return this.abortSync({ fs });
            }
            return this.finishSync({ fs });
        });
    }
    abortSync({ fs }) {
        return __awaiter(this, void 0, void 0, function* () {
            console.warn("aborting sync with errors:", this.errors);
            this.status = SyncRunStatus_1.SyncRunStatus.failed;
            this.finishedAt = moment().valueOf();
            return this.save({ fs });
        });
    }
    finishSync({ fs }) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("finished sync with warnings:", this.warnings);
            this.status = SyncRunStatus_1.SyncRunStatus.finished;
            this.finishedAt = moment().valueOf();
            return this.save({ fs });
        });
    }
    /**
     * Create a new SyncRun in FireStore
     */
    create({ fs }) {
        const newRef = fs.collection('org').doc(this.orgId).collection('syncRun').doc();
        this.id = newRef.id;
        return this.save({ fs });
    }
    save({ fs }) {
        //TODO: do we want this to merge?
        return fs.collection('org').doc(this.orgId).collection('syncRun').doc(this.id)
            .set(this.serialize())
            .then(ref => {
            return this;
        });
    }
    /**
     * Serialize the SyncRun for saving or transmission
     */
    serialize() {
        return {
            id: this.id,
            orgId: this.orgId,
            syncId: this.syncId,
            syncMethod: this.syncMethod.toString(),
            subscribers: this.subscribers,
            startedAt: moment(this.startedAt).toDate(),
            finishedAt: moment(this.finishedAt).toDate(),
            status: this.status.toString(),
            results: this.results,
            warnings: this.warnings,
            errors: this.errors,
        };
    }
    /**
     * deserialize from a firestore snapshot
     * @param sn
     */
    static deserialize(sn) {
        const { id, orgId, syncId, syncMethod, subscribers, startedAt, finishedAt, status, results, warnings, errors, } = sn.data();
        //TODO not sure the enums will des properly
        const des = new SyncRun(orgId, syncId, syncMethod, subscribers);
        des.id = id;
        des.startedAt = startedAt;
        des.finishedAt = finishedAt;
        des.status = status;
        des.results = results;
        des.warnings = warnings;
        des.errors = errors;
        return des;
    }
    /**
     * Get the sync run for the given id
     * @param param0
     */
    static getSyncRun({ orgId, id, fs }) {
        return fs.collection('org').doc(orgId).collection('syncRun').doc(id).get()
            .then(sn => SyncRun.deserialize(sn));
    }
}
exports.SyncRun = SyncRun;
//# sourceMappingURL=SyncRun.js.map