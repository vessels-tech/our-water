import { SomeResult, makeSuccess, makeError } from "../typings/AppProviderTypes";

export type FirestoreDocTypes = {
  docName: string,
  orgId: string,
  id: string,
  createdAt: Date,
  updatedAt: Date,
}


export default abstract class FirestoreDoc {

  //@ts-ignore
  docName: string
  //@ts-ignore
  orgId: string
  //@ts-ignore
  id: string
  //@ts-ignore
  createdAt: Date
  //@ts-ignore
  updatedAt: Date


  public create(firestore: any): Promise<SomeResult<FirestoreDoc>> {
    const newRef = firestore.collection('org').doc(this.orgId).collection(this.docName).doc();
    this.id = newRef.id;
    this.createdAt = new Date();

    return this.save(firestore);
  }

  /**
   * Save the model
   * 
   * If it hasn't been created, then calls create instead.
   */
  public save(firestore: any): Promise<SomeResult<FirestoreDoc>> {
    this.updatedAt = new Date();

    if (!this.id) {
      return this.create(firestore);
    }
    
    return firestore.collection('org').doc(this.orgId).collection(this.docName).doc(this.id)
      .set(this.serialize())
      .then(() => makeSuccess(this))
      .catch((err: Error) => makeError(err.message))
  }

  public abstract serialize(): any;



}