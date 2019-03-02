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
    /**
     * Create docs as part of a Batch
     * Put in an id, or allow firebase to create one for you.
     */
    batchCreate(batch, firestore, id) {
        let ref;
        if (!id) {
            ref = firestore.collection('org').doc(this.orgId).collection(this.docName).doc();
            this.id = ref.id;
        }
        else {
            console.log("Batch create:", this.orgId, this.docName, id);
            ref = firestore.collection('org').doc(this.orgId).collection(this.docName).doc(id);
            this.id = id;
        }
        this.createdAt = new Date();
        this.updatedAt = new Date();
        batch.set(ref, this.serialize());
    }
    /**
     * Delete docs as a part of a Batch
     *
     * If no ID is provided, will use the id of the FirestoreDoc.
     */
    batchDelete(batch, firestore, id) {
        let ref;
        if (!id) {
            ref = firestore.collection('org').doc(this.orgId).collection(this.docName).doc(this.id);
        }
        else {
            ref = firestore.collection('org').doc(this.orgId).collection(this.docName).doc(id);
        }
        batch.delete(ref);
    }
}
exports.default = FirestoreDoc;
//# sourceMappingURL=FirestoreDoc.js.map