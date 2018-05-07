"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ResourceIdType {
    static fromLegacyMyWellId(postcode, resourceId) {
        const legacyId = new ResourceIdType();
        legacyId.legacyMyWellId = `${postcode}.${resourceId}`;
        return legacyId;
    }
    serialize() {
        return {
            legacyMyWellId: this.legacyMyWellId,
        };
    }
}
exports.default = ResourceIdType;
//# sourceMappingURL=ResourceIdType.js.map