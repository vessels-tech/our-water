"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateDatatypes = exports.validateDatatype = exports.SyncDatatypeList = exports.SyncDatatypes = void 0;
exports.SyncDatatypes = {
    reading: 'reading',
    resource: 'resource',
    group: 'group',
};
exports.SyncDatatypeList = Object.keys(exports.SyncDatatypes).map(key => exports.SyncDatatypes[key]);
/**
 * Throw if the given datatype is not in the SyncDatatypes
 */
exports.validateDatatype = (datatype) => {
    if (exports.SyncDatatypeList.indexOf(datatype) === -1) {
        throw new Error(`Could not find datatype: ${datatype} in SyncDatatypeList.`);
    }
};
exports.validateDatatypes = (datatypes) => {
    datatypes.forEach(datatype => exports.validateDatatype(datatype));
};
//# sourceMappingURL=SyncDatatypes.js.map