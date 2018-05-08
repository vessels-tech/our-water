"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class FileDatasourceOptions {
    constructor() {
        this.includesHeadings = true;
        this.usesLegacyMyWellIds = false;
    }
    serialize() {
        return {
            includesHeadings: this.includesHeadings,
            usesLegacyMyWellIds: this.usesLegacyMyWellIds,
        };
    }
    //note:We can't make a deserializable interface, as this must be a static method
    static deserialize(object) {
        const des = new FileDatasourceOptions();
        des.includesHeadings = object.includesHeadings;
        des.usesLegacyMyWellIds = object.usesLegacyMyWellIds;
        return des;
    }
}
exports.default = FileDatasourceOptions;
//# sourceMappingURL=FileDatasourceOptions.js.map