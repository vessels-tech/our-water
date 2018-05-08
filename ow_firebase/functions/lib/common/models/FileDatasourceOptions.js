"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class FileDatasourceOptions {
    constructor() {
        this.includesHeadings = true;
        this.usesLegacyMyWellIds = false;
        this.hasHeaderRow = false;
    }
    serialize() {
        return {
            includesHeadings: this.includesHeadings,
            usesLegacyMyWellIds: this.usesLegacyMyWellIds,
            hasHeaderRow: this.hasHeaderRow,
        };
    }
}
exports.default = FileDatasourceOptions;
//# sourceMappingURL=FileDatasourceOptions.js.map