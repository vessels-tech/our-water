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
}
exports.default = FileDatasourceOptions;
//# sourceMappingURL=FileDatasourceOptions.js.map