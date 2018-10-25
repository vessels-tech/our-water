"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Datasource_1 = require("./Datasources/Datasource");
const utils_1 = require("../utils");
class Sync {
    constructor(isOneTime, datasource, orgId, methods, frequency) {
        this.lastSyncDate = 0; //unix timestamp 
        this.isOneTime = isOneTime;
        this.datasource = datasource;
        this.orgId = orgId;
        this.methods = methods;
        this.frequency = frequency;
    }
    /**
    * Create a new Sync in FireStore
    */
    create({ firestore }) {
        const newRef = firestore.collection('org').doc(this.orgId)
            .collection('sync').doc();
        this.id = newRef.id;
        return this.save({ firestore });
    }
    save({ firestore }) {
        return firestore.collection('org').doc(this.orgId).collection('sync').doc(this.id)
            .set(this.serialize())
            .then(ref => {
            return this;
        });
    }
    delete({ firestore }) {
        return firestore.collection('org').doc(this.orgId).collection('sync').doc(this.id).delete();
    }
    serialize() {
        return {
            id: this.id,
            isOneTime: this.isOneTime,
            datasource: this.datasource.serialize(),
            orgId: this.orgId,
            methods: this.methods,
            lastSyncDate: new Date(this.lastSyncDate),
            frequency: this.frequency,
        };
    }
    /**
     * Deserialize from a json object
     */
    static deserialize(data) {
        const { id, isOneTime, datasource, orgId, methods, lastSyncDate, frequency, } = data;
        const syncMethods = []; //TODO deserialize somehow
        const des = new Sync(isOneTime, Datasource_1.deserializeDatasource(datasource), orgId, syncMethods, frequency);
        //private vars
        des.lastSyncDate = lastSyncDate;
        des.id = id;
        return des;
    }
    /**
     * Deserialize from a snapshot
     * @param sn
     */
    static fromDoc(sn) {
        return this.deserialize(sn.data());
    }
    /**
     * getSyncs
     *
     * Get a list of the syncs for an org
     */
    static getSyncs(orgId, firestore) {
        return firestore.collection('org').doc(orgId).collection('sync').get()
            .then(sn => utils_1.snapshotToSyncList(sn));
    }
    /**
     * getSync
     *
     * Gets the sync from the organization and sync id
     */
    static getSync({ orgId, id, firestore }) {
        //TODO: This hangs on the 2nd time for some reason...
        return firestore.collection('org').doc(orgId).collection('sync').doc(id).get()
            .then(doc => Sync.fromDoc(doc));
    }
}
exports.Sync = Sync;
//# sourceMappingURL=Sync.js.map