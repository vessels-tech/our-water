import Serializable from "./Serializable";

export default class FileDatasourceOptions implements Serializable {
  includesHeadings: boolean = true
  usesLegacyMyWellIds: boolean = false
  hasHeaderRow: boolean = false

  serialize(): any {
    return {
      includesHeadings: this.includesHeadings,
      usesLegacyMyWellIds: this.usesLegacyMyWellIds,
      hasHeaderRow: this.hasHeaderRow,
    }
  }
}