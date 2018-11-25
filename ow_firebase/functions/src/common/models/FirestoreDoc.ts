import { Firestore } from "@google-cloud/firestore";
import { runInThisContext } from "vm";

export type FirestoreDocTypes = {
  docName: string,
  orgId: string,
  id: string,
  createdAt: Date,
  updatedAt: Date,
}


export default abstract class FirestoreDoc {

  docName: string
  orgId: string
  id: string
  createdAt: Date
  updatedAt: Date


  public create({ firestore }): Promise<FirestoreDoc> {
    const newRef = firestore.collection('org').doc(this.orgId).collection(this.docName).doc();
    this.id = newRef.id;
    this.createdAt = new Date();

    return this.save({ firestore });
  }

  public save({ firestore }): Promise<FirestoreDoc> {
    this.updatedAt = new Date();
    
    return firestore.collection('org').doc(this.orgId).collection(this.docName).doc(this.id)
      .set(this.serialize())
      .then(ref => { return this; });
  }

  /**
   * Create docs as part of a Batch
   * Put in an id, or allow firebase to create one for you.
   */
  public batchCreate(batch: FirebaseFirestore.WriteBatch, firestore: Firestore, id?: string): void {
    let ref;
    if (!id) {
      ref = firestore.collection('org').doc(this.orgId).collection(this.docName).doc();
      this.id = ref.id;
    } else {
      ref = firestore.collection('org').doc(this.orgId).collection(this.docName).doc(id);
      this.id = id;
    }

    this.createdAt = new Date();
    this.updatedAt = new Date();

    batch.set(ref, this.serialize());
  }

  public abstract serialize();

}