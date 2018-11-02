"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const FirestoreDoc_1 = require("./FirestoreDoc");
class ShortId extends FirestoreDoc_1.default {
    constructor(props) {
        super();
        this.shortId = props.shortId;
        this.longId = props.longId;
        this.lastUsed = props.lastUsed;
        this.docName = props.docName;
        this.orgId = props.orgId;
        this.id = props.id;
        this.createdAt = props.createdAt;
        this.updatedAt = props.updatedAt;
    }
    //createdAt, updatedAt, orgId from FirestoreDoc
    static fromShortId(orgId, props) {
        return new ShortId(Object.assign({}, props, { id: props.shortId, docName: ShortId.docName, orgId, createdAt: new Date(), updatedAt: new Date() }));
    }
    serialize() {
        return {
            docName: this.docName,
            id: this.id,
            orgId: this.orgId,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            shortId: this.shortId,
            longId: this.longId,
            lastUsed: this.lastUsed,
        };
    }
    static deserialize(data) {
        return new ShortId(data);
    }
}
ShortId.docName = 'shortId';
exports.default = ShortId;
//# sourceMappingURL=ShortId.js.map