

export default abstract class FirestoreDoc {

  docName: string
  orgId: string
  id: string
  createdAt: Date
  updatedAt: Date


  public create({ fs }): Promise<FirestoreDoc> {
    const newRef = fs.collection('org').doc(this.orgId).collection(this.docName).doc();
    this.id = newRef.id;
    this.createdAt = new Date();

    return this.save({ fs });
  }

  public save({ fs }): Promise<FirestoreDoc> {
    this.updatedAt = new Date();

    // console.log("serializing: ", this.serialize());

    return fs.collection('org').doc(this.orgId).collection(this.docName).doc(this.id)
      .set(this.serialize())
      .then(ref => { return this; });
  }

  public abstract serialize();



}