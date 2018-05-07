export default class ResourceIdType {
  legacyMyWellId: string | null


  static fromLegacyMyWellId(postcode: number, resourceId: number): ResourceIdType {
    const legacyId = new ResourceIdType();
    legacyId.legacyMyWellId = `${postcode}.${resourceId}`;

    return legacyId
  }

  public serialize(): any {
    return {
      legacyMyWellId: this.legacyMyWellId,
    };
  }

}