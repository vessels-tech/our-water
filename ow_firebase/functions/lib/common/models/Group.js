"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Group {
    constructor(name, orgId, type, coords) {
        this.name = name;
        this.orgId = orgId;
        this.type = type;
        this.coords = coords;
    }
    create({ fs }) {
        const newRef = fs.collection('org').doc(this.orgId).collection('group').doc();
        this.id = newRef.id;
        return this.save({ fs });
    }
    save({ fs }) {
        return fs.collection('org').doc(this.orgId).collection('group').doc(this.id)
            .set(this.serialize())
            .then(ref => {
            return this;
        });
    }
    // public static bulkGroup(fs, groups: Array<Group>): Promise<Array<Group>> {
    // }
    serialize() {
        return {
            id: this.id,
            name: this.name,
            type: this.type,
            coords: this.coords,
        };
    }
}
exports.Group = Group;
//# sourceMappingURL=Group.js.map