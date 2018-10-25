"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("util");
class Group {
    constructor(name, orgId, type, coords, externalIds) {
        this.name = name;
        this.orgId = orgId;
        this.type = type;
        this.coords = coords;
        this.externalIds = externalIds;
    }
    create({ firestore }) {
        const newRef = firestore.collection('org').doc(this.orgId).collection('group').doc();
        this.id = newRef.id;
        this.createdAt = new Date();
        return this.save({ firestore });
    }
    save({ firestore }) {
        if (!this.id) {
            throw new Error('Tried to save, but object has not been created yet. Use create() instead.');
        }
        this.updatedAt = new Date();
        return firestore.collection('org').doc(this.orgId).collection('group').doc(this.id)
            .set(this.serialize())
            .then(ref => {
            return this;
        });
    }
    static saveBulkGroup(firestore, groups) {
        return Promise.resolve([]);
    }
    serialize() {
        const base = {
            id: this.id,
            name: this.name,
            type: this.type,
            coords: this.coords,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
        };
        //TODO: this is less than ideal
        if (this.externalIds) {
            let serializedExternalId = null;
            try {
                serializedExternalId = this.externalIds.serialize();
                if (!util_1.isNullOrUndefined(serializedExternalId.legacyMyWellId)) {
                    base['externalIds'] = serializedExternalId;
                }
            }
            catch (err) {
                console.log("Error", err);
            }
        }
        return base;
    }
}
exports.Group = Group;
//# sourceMappingURL=Group.js.map