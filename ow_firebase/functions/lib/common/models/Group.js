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
    create({ fs }) {
        const newRef = fs.collection('org').doc(this.orgId).collection('group').doc();
        this.id = newRef.id;
        this.createdAt = new Date();
        return this.save({ fs });
    }
    save({ fs }) {
        this.updatedAt = new Date();
        return fs.collection('org').doc(this.orgId).collection('group').doc(this.id)
            .set(this.serialize())
            .then(ref => {
            return this;
        });
    }
    static saveBulkGroup(fs, groups) {
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
            catch (_a) {
            }
        }
        console.log("base is:", base);
        return base;
    }
}
exports.Group = Group;
//# sourceMappingURL=Group.js.map