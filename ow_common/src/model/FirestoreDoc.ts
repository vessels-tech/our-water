// import * as admin from "firebase-admin";
// import { runInThisContext } from "vm";

export type FirestoreDocTypes = {
  docName: string,
  orgId: string,
  id: string,
  createdAt: Date,
  updatedAt: Date,
}


export class FirestoreDoc<T> {
  props: T;
  // docName: string
  // orgId: string
  // id: string
  // createdAt: Date
  // updatedAt: Date

  constructor(props: T) {
    this.props = props;
  }


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

  // /**
  //  * Create docs as part of a Batch
  //  * Put in an id, or allow firebase to create one for you.
  //  */
  // public batchCreate(batch: FirebaseFirestore.WriteBatch, firestore: FirebaseFirestore.Firestore, id?: string): void {
  //   let ref;
  //   if (!id) {
  //     ref = firestore.collection('org').doc(this.orgId).collection(this.docName).doc();
  //     this.id = ref.id;
  //   } else {
  //     ref = firestore.collection('org').doc(this.orgId).collection(this.docName).doc(id);
  //     this.id = id;
  //   }

  //   this.createdAt = new Date();
  //   this.updatedAt = new Date();
  //   batch.set(ref, this.serialize());
  // }

  // /**
  //  * Delete docs as a part of a Batch
  //  * 
  //  * If no ID is provided, will use the id of the FirestoreDoc.
  //  */
  // public batchDelete(batch: FirebaseFirestore.WriteBatch, firestore: FirebaseFirestore.Firestore, id?: string): void {
  //   let ref;
  //   if (!id) {
  //     ref = firestore.collection('org').doc(this.orgId).collection(this.docName).doc(this.id);
  //   } else {
  //     ref = firestore.collection('org').doc(this.orgId).collection(this.docName).doc(id);
  //   }
  //   batch.delete(ref);
  // }

  // public abstract serialize();

}