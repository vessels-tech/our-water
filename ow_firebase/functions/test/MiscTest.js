
const assert = require('assert');
const request = require('request-promise-native');
const sleep = require('thread-sleep');
const firebase = require('firebase-admin');

const {Group} = require('../lib/common/models/Group');
const ResourceIdType = require('../lib/common/types/ResourceIdType').default;
const { createNewSync } = require('./TestUtils');

const baseUrl = process.env.BASE_URL;
const orgId = process.env.ORG_ID;

const utils = require('../lib/common/utils');


module.exports = ({fs}) => {
  
  describe('Misc Tests', function() {

    describe('csv utils', function() {
      this.timeout(10000);

      it('downloads and parses file', () => {
        const url = 'https://firebasestorage.googleapis.com/v0/b/our-water.appspot.com/o/MywelluploadDharta2017.xlsx%20-%20B-Well.tsv?alt=media&token=1e17d48f-5404-4f27-90f3-fb6a76a6dc45';
        return utils.downloadAndParseCSV(url);
      });
    });

    describe('serializer utils', () => {

      it('serializes a map', () => {
        const input = new Map();
        input.set('abc', true);
        input.set('def', false);

        const result = utils.serializeMap(input);
        console.log(result);

        assert.deepEqual(result, {abc: true, def: false});
      });

      it('converts an object to a map', () => {
        const input = {
          abc: true, 
          def: false
        };

        const result = utils.anyToMap(input);
        
        const expected = new Map();
        expected.set('abc', true);
        expected.set('def', false);

        assert.deepEqual(result, expected);
      });
    });

    
    describe('getLegacyGroups', () => {
      this.timeout(10000);
      let groupIdsToCleanup = [];

      before(function() {
        this.timeout(10000);

        //Create 3 groups, 2 of which are legacy
        const coords = new firebase.firestore.GeoPoint(0, 0);
        // const group1 = new Group("group1", orgId, "village", coords, utils.anyToMap({ 'mywell.12345.1':true }));
        const group1 = new Group("group1", orgId, "village", coords, ResourceIdType.fromLegacyVillageId(12345, 1));
        const group2 = new Group("group2", orgId, "pincode", coords, ResourceIdType.fromLegacyPincode(12345));
        const group3 = new Group("group3", orgId, "village", coords, new ResourceIdType());

        return Promise.all([
          group1.create({fs}).then(group => groupIdsToCleanup.push(group.id)),
          group2.create({fs}).then(group => groupIdsToCleanup.push(group.id)),
          group3.create({fs}).then(group => groupIdsToCleanup.push(group.id))
        ]);
      });

      after(function() {
        this.timeout(5000);
        console.log(`cleaning up ${groupIdsToCleanup.length} groups`);
        groupIdsToCleanup.forEach(id => fs.collection('org').doc(orgId).collection('group').doc(id).delete());

      });

      //TODO: we need to make sure each test is siloed first...
      it.skip('getLegacyGroups gets legacy groups in the correct format', async () => {
        const legacyGroups = await utils.getLegacyMyWellGroups(orgId, fs);
        //Make sure there are only 2
        assert.equal(2, Object.keys(utils.serializeMap(legacyGroups)).length);
      });
    });
  });

}