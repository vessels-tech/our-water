"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
        console.log("serialized", this.serialize());
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
        return {
            id: this.id,
            name: this.name,
            type: this.type,
            coords: this.coords,
            //this is just placeholder to see if we can get this to work.
            externalIds: Array.from(this.externalIds).reduce((obj, [key, value]) => (Object.assign(obj, { [key]: value })), {}),
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
        };
    }
}
exports.Group = Group;
//# sourceMappingURL=Group.js.map