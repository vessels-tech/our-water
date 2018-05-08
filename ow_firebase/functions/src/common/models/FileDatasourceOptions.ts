import Serializable from "./Serializable";

export default class FileDatasourceOptions implements Serializable {
  includesHeadings: boolean = true
  usesLegacyMyWellIds: boolean = false

  serialize(): any {
    return {
      includesHeadings: this.includesHeadings,
      usesLegacyMyWellIds: this.usesLegacyMyWellIds,
    }
  }

  //note:We can't make a deserializable interface, as this must be a static method
  static deserialize(object): FileDatasourceOptions {

    const des: FileDatasourceOptions = new FileDatasourceOptions();
    des.includesHeadings = object.includesHeadings;
    des.usesLegacyMyWellIds = object.usesLegacyMyWellIds;

    return des;
  }


}