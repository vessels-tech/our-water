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
const Datasource_1 = require("./Datasources/Datasource");
class Sync {
    constructor(isOneTime, datasource, orgId, methods, selectedDatatypes) {
        this.lastSyncDate = 0; //unix timestamp 
        this.isOneTime = isOneTime;
        this.datasource = datasource;
        this.orgId = orgId;
        this.methods = methods;
        this.selectedDatatypes = selectedDatatypes;
    }
    /**
    * Create a new Sync in FireStore
    */
    create({ fs }) {
        const newRef = fs.collection('org').doc(this.orgId)
            .collection('sync').doc();
        this.id = newRef.id;
        return this.save({ fs });
    }
    save({ fs }) {
        return fs.collection('org').doc(this.orgId).collection('sync').doc(this.id)
            .set(this.serialize())
            .then(ref => {
            return this;
        });
    }
    serialize() {
        return {
            id: this.id,
            isOneTime: this.isOneTime,
            datasource: this.datasource.serialize(),
            orgId: this.orgId,
            methods: this.methods,
            lastSyncDate: new Date(this.lastSyncDate),
            selectedDatatypes: this.selectedDatatypes,
        };
    }
    /**
     * Deserialize from a snapshot
     * @param sn
     */
    static deserialize(sn) {
        const { isOneTime, datasource, orgId, methods, lastSyncDate, selectedDatatypes, } = sn.data();
        const syncMethods = []; //TODO deserialize somehow
        const des = new Sync(isOneTime, Datasource_1.deserializeDatasource(datasource), orgId, syncMethods, selectedDatatypes);
        //private vars
        des.lastSyncDate = lastSyncDate;
        des.id = sn.id;
        return des;
    }
    /**
     * getSync
     *
     * Gets the sync from the organization and sync id
     */
    static getSync({ orgId, id, fs }) {
        return __awaiter(this, void 0, void 0, function* () {
            return fs.collection('org').doc(orgId).collection('sync').doc(id).get()
                .then(sn => Sync.deserialize(sn));
        });
    }
}
exports.Sync = Sync;
//# sourceMappingURL=Sync.js.map