"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class FirestoreDoc {
    create({ fs }) {
        const newRef = fs.collection('org').doc(this.orgId).collection(this.docName).doc();
        this.id = newRef.id;
        this.createdAt = new Date();
        return this.save({ fs });
    }
    save({ fs }) {
        this.updatedAt = new Date();
        // console.log("serializing: ", this.serialize());
        return fs.collection('org').doc(this.orgId).collection(this.docName).doc(this.id)
            .set(this.serialize())
            .then(ref => { return this; });
    }
}
exports.default = FirestoreDoc;
//# sourceMappingURL=FirestoreDoc.js.map