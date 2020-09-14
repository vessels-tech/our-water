import * as mocha from 'mocha';
import * as assert from 'assert';

import { firestore } from '../test/TestFirebase';
import { downloadAndParseCSV, serializeMap, anyToMap, getLegacyMyWellGroups, loadRemoteConfig, getDefaultTimeseries } from './utils';
import ResourceIdType from './types/ResourceIdType';
import { Group } from './models/Group';
import { GroupType } from './enums/GroupType';
import * as FbFirestore from 'firebase-admin';
import { unsafeUnwrap } from 'ow_common/lib/utils';
import ResourceStationType from 'ow_common/lib/enums/ResourceStationType';
import { MyWellResourceTypes } from '../../tools/mywellConfig';

type GeoPoint = FbFirestore.firestore.GeoPoint;

const orgId = process.env.ORG_ID;
  
describe('Misc Tests', function() {

  describe('csv utils', function() {
    this.timeout(10000);

    it('downloads and parses file', () => {
      //TODO: this will break. We should upload it beforehand
      const url = 'https://firebasestorage.googleapis.com/v0/b/our-water.appspot.com/o/MywelluploadDharta2017.xlsx%20-%20B-Well.tsv?alt=media&token=1e17d48f-5404-4f27-90f3-fb6a76a6dc45';
      return downloadAndParseCSV(url);
    });
  });

  describe('serializer utils', () => {

    it('serializes a map', () => {
      const input = new Map();
      input.set('abc', true);
      input.set('def', false);

      const result = serializeMap(input);

      assert.deepEqual(result, {abc: true, def: false});
    });

    it('converts an object to a map', () => {
      const input = {
        abc: true, 
        def: false
      };

      const result = anyToMap(input);
      
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
      const coords: GeoPoint = new FbFirestore.firestore.GeoPoint(0, 0);
      // const group1 = new Group("group1", orgId, "village", coords, utils.anyToMap({ 'mywell.12345.1':true }));
      const group1 = new Group("group1", orgId, GroupType.Village, [coords], ResourceIdType.fromLegacyVillageId(12345, 1));
      const group2 = new Group("group2", orgId, GroupType.Pincode, [coords], ResourceIdType.fromLegacyPincode(12345));
      const group3 = new Group("group3", orgId, GroupType.Village, [coords], new ResourceIdType());

      return Promise.all([
        group1.create({firestore}).then(group => groupIdsToCleanup.push(group.id)),
        group2.create({firestore}).then(group => groupIdsToCleanup.push(group.id)),
        group3.create({firestore}).then(group => groupIdsToCleanup.push(group.id))
      ]);
    });

    after(function() {
      this.timeout(5000);
      groupIdsToCleanup.forEach(id => firestore.collection('org').doc(orgId).collection('group').doc(id).delete());

    });

    //TODO: we need to make sure each test is siloed first...
    it.skip('getLegacyGroups gets legacy groups in the correct format', async () => {
      const legacyGroups = await getLegacyMyWellGroups(orgId, firestore);
      //Make sure there are only 2
      assert.equal(2, Object.keys(serializeMap(legacyGroups)).length);
    });
  });

  describe('remote config lookup', function () {
    this.timeout(7000);
    this.slow(3000);

    it('Gets the remote config', async () => {
      //Arrange

      //Act
      const result = unsafeUnwrap(await loadRemoteConfig());

      //Assert
    });

    it('Gets the default quality timeseries', async () => {
      const expected = MyWellResourceTypes.quality;

      //Act
      const result = unsafeUnwrap(await getDefaultTimeseries(ResourceStationType.quality));

      //Assert
      assert.deepStrictEqual(result, expected);
    });

    it('Gets the default checkdam timeseries', async () => {
      //Arrange
      const expected = [{ name: 'default', parameter: 'default', readings: [], unitOfMeasure: 'm' }];
      //Act
      const result = unsafeUnwrap(await getDefaultTimeseries(ResourceStationType.checkdam));

      //Assert
      assert.deepStrictEqual(result, expected);
    });

  });
});