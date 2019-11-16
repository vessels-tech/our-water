/**
 * FirestoreDoc
 * 
 * This is a second pass at a kind of ORM for Firestore.
 * It has many issues, and so shouldn't be used as of yet, 
 * but can hopefully inform future work in this area.
 * 
 * 
 */


import * as admin from "firebase-admin";
type Firestore = admin.firestore.Firestore;
import { DocumentData, DocumentSnapshot, SetOptions } from "@google-cloud/firestore";
import { Maybe, isUndefined } from "./Maybe";
import { SomeResult, makeSuccess, makeError } from "./AppProviderTypes";



export type FirestoreDocTypes = {
  orgId: string,
  id: Maybe<string>
  createdAt: Maybe<Date>
  updatedAt: Maybe<Date> 
}


export class FirestoreDoc<T> {
  firestore: Firestore
  props: T & FirestoreDocTypes;
  docName: Maybe<string> = undefined;

  constructor(firestore: Firestore, orgId: string, props: T) {
    this.firestore = firestore;
    this.props = {
      ...props,
      orgId,
      id: undefined,
      createdAt: undefined,
      updatedAt: undefined,
    }
  }


  public create(): Promise<SomeResult<FirestoreDoc<T>>> {
    if (isUndefined(this.docName)) {
      throw new Error("called create() on firestoredoc, but docname is undefined.");
    }

    const newRef = this.firestore.collection('org').doc(this.props.orgId).collection(this.docName).doc();
    this.props.id = newRef.id;
    this.props.createdAt = new Date();

    return this.save();
  }

  public save(options?: SetOptions): Promise<SomeResult<FirestoreDoc<T>>> {
    this.props.updatedAt = new Date();

    if (isUndefined(this.props.id)) {
      throw new Error("called save() on firestoredoc, but id is undefined.");
    }

    if (isUndefined(this.docName)) {
      throw new Error("called create() on firestoredoc, but docname is undefined.");
    }
    
    return this.firestore.collection('org').doc(this.props.orgId).collection(this.docName).doc(this.props.id)
      .set(this.serialize(), options)
      .then(ref => makeSuccess(this))
      .catch((err: Error) => makeError(err.message));
  }

  /**
   * Create docs as part of a Batch
   * Put in an id, or allow firebase to create one for you.
   */
  public batchCreate(batch: FirebaseFirestore.WriteBatch, firestore: FirebaseFirestore.Firestore, id?: string): void {
    if (isUndefined(this.docName)) {
      throw new Error("called create() on firestoredoc, but docname is undefined.");
    }

    let ref;
    if (!id) {
      ref = firestore.collection('org').doc(this.props.orgId).collection(this.docName).doc();
      this.props.id = ref.id;
    } else {
      ref = firestore.collection('org').doc(this.props.orgId).collection(this.docName).doc(id);
      this.props.id = id;
    }

    this.props.createdAt = new Date();
    this.props.updatedAt = new Date();
    batch.set(ref, this.serialize());
  }

  /**
   * Delete docs as a part of a Batch
   * 
   * If no ID is provided, will use the id of the FirestoreDoc.
   */
  public batchDelete(batch: FirebaseFirestore.WriteBatch, firestore: FirebaseFirestore.Firestore, id?: string): void {
    if (isUndefined(this.docName)) {
      throw new Error("called create() on firestoredoc, but docname is undefined.");
    }

    if (isUndefined(this.props.id)) {
      throw new Error("called save() on firestoredoc, but id is undefined.");
    }

    let ref;
    if (!id) {
      ref = firestore.collection('org').doc(this.props.orgId).collection(this.docName).doc(this.props.id);
    } else {
      ref = firestore.collection('org').doc(this.props.orgId).collection(this.docName).doc(id);
    }
    batch.delete(ref);
  }

  public serialize(): DocumentData {
    return this.props;
  }

  public underlyingProps(): T {
    return this.props;
  }

  //We use U here as static superclasses can't infer the generic type T
  public static _get<U>(firestore: Firestore, docName: string, orgId: string, id: string, transform: (data: any) => U): Promise<SomeResult<FirestoreDoc<U>>> {

    return firestore.collection('org').doc(orgId).collection(docName).doc(id).get()
      .then((sn: DocumentSnapshot) => {
        const data = sn.data();
        if (!data) {
          throw new Error(`Couldn't get model for params: ${docName}, ${orgId}, ${id}`);
        }
        const parsed: U = transform(data);
        const doc: FirestoreDoc<U> = new FirestoreDoc<U>(firestore, orgId, parsed);
        return makeSuccess(doc);
      })
      .catch((err: Error) => makeError<FirestoreDoc<U>>(err.message))
  }

}