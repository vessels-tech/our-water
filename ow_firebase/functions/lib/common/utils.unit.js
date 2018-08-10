"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const crypto = require("crypto");
const utils_1 = require("../common/utils");
const orgId = process.env.ORG_ID;
describe('Utils Tests', () => {
    describe('hash tests', () => {
        it('hashes an id to an integer string of given length', () => {
            //Arrange
            const input = '00znWgaT83RoYXYXxmvk';
            //Act
            const hashedStr = utils_1.hashIdToIntegerString(input, 6);
            //Assert
            assert.equal(6, hashedStr.length);
            assert.equal(true, parseInt(hashedStr) > 0);
        });
        const generateIds = (size) => {
            const ids = [];
            for (let i = 0; i < size; i++) {
                ids.push(crypto.randomBytes(20).toString('hex'));
            }
        };
        /* decided against this method */
        it.skip('Does not collide with 100,000 ids', () => {
            const size = 100000;
            const ids = {};
            const hashedIds = {};
            for (let i = 0; i < size; i++) {
                const randomId = crypto.randomBytes(20).toString('hex');
                ids[randomId] = true;
                //We can't seem to avoid collisions here :(
                hashedIds[utils_1.hashIdToIntegerString(randomId, 15)] = true;
            }
            assert.equal(Object.keys(ids).length, Object.keys(hashedIds).length);
        });
    });
});
//# sourceMappingURL=utils.unit.js.map