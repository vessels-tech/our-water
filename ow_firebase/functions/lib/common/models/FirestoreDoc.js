"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class FirestoreDoc {
    create({ firestore }) {
        const newRef = firestore.collection('org').doc(this.orgId).collection(this.docName).doc();
        this.id = newRef.id;
        this.createdAt = new Date();
        return this.save({ firestore });
    }
    save({ firestore }) {
        this.updatedAt = new Date();
        return firestore.collection('org').doc(this.orgId).collection(this.docName).doc(this.id)
            .set(this.serialize())
            .then(ref => { return this; });
    }
}
exports.default = FirestoreDoc;
//# sourceMappingURL=FirestoreDoc.js.map