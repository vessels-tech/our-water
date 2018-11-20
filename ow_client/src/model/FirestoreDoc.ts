
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

  public abstract serialize();



}