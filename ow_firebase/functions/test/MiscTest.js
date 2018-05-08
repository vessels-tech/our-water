
const assert = require('assert');
const request = require('request-promise-native');
const sleep = require('thread-sleep');
const firebase = require('firebase-admin');

const {Group} = require('../lib/common/models/Group');
const { createNewSync } = require('./TestUtils');

const baseUrl = process.env.BASE_URL;
const orgId = process.env.ORG_ID;

const utils = require('../lib/common/utils');


module.exports = ({fs}) => {
  describe('Misc Tests', function() {

    
    describe('getLegacyGroups', () => {
      this.timeout(10000);

      before(function() {
        this.timeout(10000);

        console.log("firebase", firebase);
        console.log("firestore", firebase.firestore);
        //Create 3 groups, 2 of which are legacy
        const coords = new firebase.firestore.GeoPoint(0, 0);
        const group1 = new Group("group1", orgId, "village", coords, { 'mywell.12345.1':true });
        const group2 = new Group("group2", orgId, "pincode", coords, { 'mywell.12345': true });
        const group3 = new Group("group3", orgId, "village", coords, {});

        return Promise.all([
          group1.create({fs}),
          group2.create({fs}),
          group3.create({fs}),
        ]);
      });

      it.only('getLegacyGroups gets legacy groups in the correct format', async () => {
        console.log(utils);

        const legacyGroups = await utils.getLegacyGroups(orgId, fs);
        console.log("legacyGroups are", legacyGroups);


      });
    });
  });

}