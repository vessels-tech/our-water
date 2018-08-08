"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const SyncDatatypes_1 = require("./SyncDatatypes");
describe('SyncDatatype', function () {
    it('throws if the given datatype cannot be found', () => {
        //Act & Assert
        assert.throws(() => { SyncDatatypes_1.validateDatatype('blablhaasd'); }, /^Error: Could not find*/);
    });
    it('finds the datatype', () => {
        SyncDatatypes_1.validateDatatype('reading');
    });
});
//# sourceMappingURL=SyncDatatype.unit.js.map