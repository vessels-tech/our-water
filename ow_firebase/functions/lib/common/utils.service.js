"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const Firestore_1 = require("../common/apis/Firestore");
const utils_1 = require("../common/utils");
const ResourceIdType_1 = require("../common/types/ResourceIdType");
const OWGeoPoint_1 = require("../common/models/OWGeoPoint");
const orgId = process.env.ORG_ID;
describe('Misc Tests', function () {
    describe('csv utils', function () {
        this.timeout(10000);
        it('downloads and parses file', () => {
            //TODO: this will break. We should upload it beforehand
            const url = 'https://firebasestorage.googleapis.com/v0/b/our-water.appspot.com/o/MywelluploadDharta2017.xlsx%20-%20B-Well.tsv?alt=media&token=1e17d48f-5404-4f27-90f3-fb6a76a6dc45';
            return utils_1.downloadAndParseCSV(url);
        });
    });
    describe('serializer utils', () => {
        it('serializes a map', () => {
            const input = new Map();
            input.set('abc', true);
            input.set('def', false);
            const result = utils_1.serializeMap(input);
            console.log(result);
            assert.deepEqual(result, { abc: true, def: false });
        });
        it('converts an object to a map', () => {
            const input = {
                abc: true,
                def: false
            };
            const result = utils_1.anyToMap(input);
            const expected = new Map();
            expected.set('abc', true);
            expected.set('def', false);
            assert.deepEqual(result, expected);
        });
    });
    describe('getLegacyGroups', () => {
        this.timeout(10000);
        let groupIdsToCleanup = [];
        before(function () {
            this.timeout(10000);
            //Create 3 groups, 2 of which are legacy
            const coords = new OWGeoPoint_1.default;
            // const group1 = new Group("group1", orgId, "village", coords, utils.anyToMap({ 'mywell.12345.1':true }));
            const group1 = new Group("group1", orgId, "village", coords, ResourceIdType_1.default.fromLegacyVillageId(12345, 1));
            const group2 = new Group("group2", orgId, "pincode", coords, ResourceIdType_1.default.fromLegacyPincode(12345));
            const group3 = new Group("group3", orgId, "village", coords, new ResourceIdType_1.default());
            return Promise.all([
                group1.create({ fs: Firestore_1.default }).then(group => groupIdsToCleanup.push(group.id)),
                group2.create({ fs: Firestore_1.default }).then(group => groupIdsToCleanup.push(group.id)),
                group3.create({ fs: Firestore_1.default }).then(group => groupIdsToCleanup.push(group.id))
            ]);
        });
        after(function () {
            this.timeout(5000);
            console.log(`cleaning up ${groupIdsToCleanup.length} groups`);
            groupIdsToCleanup.forEach(id => Firestore_1.default.collection('org').doc(orgId).collection('group').doc(id).delete());
        });
        //TODO: we need to make sure each test is siloed first...
        it.skip('getLegacyGroups gets legacy groups in the correct format', () => __awaiter(this, void 0, void 0, function* () {
            const legacyGroups = yield utils_1.getLegacyMyWellGroups(orgId, Firestore_1.default);
            //Make sure there are only 2
            assert.equal(2, Object.keys(utils_1.serializeMap(legacyGroups)).length);
        }));
    });
});
//# sourceMappingURL=utils.service.js.map