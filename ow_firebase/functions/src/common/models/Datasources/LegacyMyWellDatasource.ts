import Datasource from './Datasource';
import { DatasourceType } from '../../enums/DatasourceType';
import * as request from 'request-promise-native';
import { Group } from '../Group';
import * as moment from 'moment';

import { createDiamondFromLatLng, findGroupMembershipsForResource, getLegacyMyWellGroups, getLegacyMyWellResources, findResourceMembershipsForResource, findGroupMembershipsForReading, concatSaveResults, resultWithError, resourceIdForResourceType, hashIdToIntegerString, snapshotToResourceList, chunkArray } from '../../utils';
import LegacyVillage from '../../types/LegacyVillage';
import { GroupType } from '../../enums/GroupType';
import LegacyResource from '../../types/LegacyResource';
import { Resource, FBTimeseriesMap } from '../Resource';
import ResourceIdType from '../../types/ResourceIdType';
import { ResourceType, resourceTypeFromString } from '../../enums/ResourceType';
import ResourceOwnerType from '../../types/ResourceOwnerType';
import { Reading } from '../Reading';
import LegacyReading from '../../types/LegacyReading';
import SyncRunResult from '../../types/SyncRunResult';

import {mywellLegacyAccessToken} from '../../env';
import GroupSaveResult from '../../types/GroupSaveResult';
import ResourceSaveResult from '../../types/ResourceSaveResult';
import ReadingSaveResult from '../../types/ReadingSaveResult';
import SyncDataSourceOptions from '../../types/SyncDataSourceOptions';
import { LegacyMyWellReading } from '../LegacyMyWellReading';
import { DataType } from '../../enums/FileDatasourceTypes';
import { DefaultSyncRunResult } from '../DefaultSyncRunResult';
import { GeoPoint, OWGeoPoint } from 'ow_types';
import FirebaseApi from '../../apis/FirebaseApi';


export type WarningType = {
  type: 'MalformedDate' | 'NoResourceMembership',
  message: string,
}

export default class LegacyMyWellDatasource implements Datasource {
  baseUrl: string
  type: DatasourceType
  selectedDatatypes: Array<string>;

  constructor(baseUrl: string, selectedDatatypes: Array<string>) {
    this.baseUrl = baseUrl;
    this.type = DatasourceType.LegacyMyWellDatasource;
    this.selectedDatatypes = selectedDatatypes
  }


  public static transformLegacyVillagesToGroups(orgId: string, villages: Array<LegacyVillage>): Array<Group> {
    return villages.map(village => {
      const coords: Array<OWGeoPoint> = createDiamondFromLatLng(village.coordinates.lat, village.coordinates.lng, 0.1);
      const externalIds = ResourceIdType.fromLegacyVillageId(village.postcode, village.id);

      return new Group(village.name, orgId, GroupType.Village, coords, externalIds);
    });
  }
 
  /**
   * Iterates through pincodes and villages from MyWell datasource
   * 
   * As villages have only a single point, we create our own
   * imaginary bounding box for the new group
   * 
   */
  public getGroupData(): Promise<Array<LegacyVillage>> {
    // https://mywell-server.vessels.tech/api/villages
    //TODO proper Legacy Api Client
    const uriVillage = `${this.baseUrl}/api/villages`;

    const options = {
      method: 'GET',
      uri: uriVillage,
      json: true,
    };

    return request(options)
    .then((response: Array<LegacyVillage>) => {
      return response;
    });
  }

  public saveGroups(orgId, firestore, groups: Array<Group>): Promise<GroupSaveResult> {
    const errors = [];
    const savedGroups: Group[] = [];

    return Promise.all(
      groups.map(group => {
        return group.create({ firestore })
          .then(savedGroup => savedGroups.push(savedGroup))
          .catch(err => errors.push(err))
      })
    ).then(() => {
      return {
        results: savedGroups,
        warnings: [],
        errors,
      };
    });
  }
  
  public async getGroupAndSave(orgId: string, firestore): Promise<GroupSaveResult>  {
    const legacyVillages: Array<LegacyVillage> = await this.getGroupData();
    const newGroups: Array<Group> = LegacyMyWellDatasource.transformLegacyVillagesToGroups(orgId, legacyVillages);
    
    return await this.saveGroups(orgId, firestore, newGroups);
  }

  /**
   * Create groups based on inferred pincode data
   * 
   */  
  public getPincodeData(orgId: string, firestore): Promise<GroupSaveResult> {
    //Get all villages, and for each village within a pincode, create a bounding box based on the center
    const uriVillage = `${this.baseUrl}/api/villages`;

    const options = {
      method: 'GET',
      uri: uriVillage,
      json: true,
    };

    let pincodeGroups: Array<Group> = null;
    const pincodeIds = {};

    return request(options)
    .then((villages: Array<LegacyVillage>) => {
      //group the villages by id
      villages.forEach(v => {
        let groupList = pincodeIds[v.postcode];
        if (!groupList) {
          groupList = [];
        }
        groupList.push(v);
        pincodeIds[v.postcode] = groupList;
      });

      //Now go through each pincode group, and create a single group
      pincodeGroups = Object.keys(pincodeIds).map(pincode => {
        const legacyVillages: Array<LegacyVillage> = pincodeIds[pincode];
        //TODO: the only issue with this approach is that the coordinates aren't in order.
        const coords = legacyVillages.map(v => new OWGeoPoint(v.coordinates.lat, v.coordinates.lng));
        const externalIds = ResourceIdType.fromLegacyPincode(pincode);

        return new Group(pincode, orgId, GroupType.Pincode, coords, externalIds);
      });

      let errors = [];
      let savedGroups = [];
      pincodeGroups.forEach(group => {
        return group.create({firestore})
          .then(savedGroup => savedGroups.push(savedGroup))
          .catch(err => {
            console.log("err", err);
            errors.push(err)}
          );
      });

      return {
        results: pincodeGroups,
        warnings: [],
        errors,
      };
    });    
  }


  /**
   * get all resources from MyWell
   * 
   * This doesn't require pagination, so we won't bother implementing it yet.
   * convert legacy MyWell resources into OW resources
   * return
   */
  public getResourcesData(orgId: string, firestore): Promise<DefaultSyncRunResult> {
    // const uriResources = `${this.baseUrl}/api/resources?filter=%7B%22where%22%3A%7B%22resourceId%22%3A1110%7D%7D`;
    const uriResources = `${this.baseUrl}/api/resources`;
    console.log("Getting resources data url", uriResources);

    const options = {
      method: 'GET',
      uri: uriResources,
      json: true,
    };

    let resources: Array<Resource> = [];
    let legacyGroups = null;
    return getLegacyMyWellGroups(orgId, firestore)
    .then(_legacyGroups => legacyGroups = _legacyGroups)
    .then(() => request(options))
    .then(async (legacyRes: Array<LegacyResource>) => {
      legacyRes.forEach(r => {
        const externalIds: ResourceIdType = ResourceIdType.fromLegacyMyWellId(r.postcode, r.id);
        const coords = new OWGeoPoint(r.geo.lat, r.geo.lng);
        const resourceType = resourceTypeFromString(r.type);
        const owner: ResourceOwnerType = {name: r.owner, createdByUserId: 'default'};
        const groups: Map<string, boolean> = findGroupMembershipsForResource(r, legacyGroups);
        //A basic timeseries map
        const timeseries: FBTimeseriesMap = {default: {id: 'default'}};

        const newResource: Resource = new Resource(orgId, externalIds, coords, resourceType, owner, groups, timeseries);
        newResource.lastReadingDatetime = moment(r.last_date).toDate();
        newResource.lastValue = r.last_value;
        resources.push(newResource);
      });

      const errors = [];
      const savedResources: Array<Resource> = [];
      //TODO: do this in a batch
      await Promise.all(resources.map(res => res.create({ firestore })
        .then((savedRes: Resource) => savedResources.push(savedRes))
        .catch(err => {
          console.log("Error saving resource", res);
          errors.push(err)
        })
      ));

      return {
        results: [`Saved ${savedResources.length} resources`],
        warnings: [],
        errors,
      };
    });
  }

  /**
   * Get all readings from MyWell
   * 
   * This also doesn't require pagination, but is expensive.
   * Perhaps we should test with just a small number of readings for now
   * 
   * 
   * ?filter=%7B%22where%22%3A%7B%22date%22%3A%7B%22gt%22%3A%20%222018-01-01T00%3A00%3A00.000Z%22%7D%7D%7D
   */
  public getReadingsData(orgId: string, firestore): Promise<DefaultSyncRunResult>  {
    const fbApi = new FirebaseApi(firestore);
    const START_DATE = "2000-01-01T00:00:00.000Z";
    const END_DATE = "2012-01-01T00:00:00.000Z";
    const filter = { "where": { "and": [{ "date": { "gte": `${START_DATE}` } }, { "date": { "lte": `${END_DATE}` } } ]}};
    const uriReadings = `${this.baseUrl}/api/readings?filter=${encodeURIComponent(JSON.stringify(filter))}&access_token=${mywellLegacyAccessToken}`; //TODO: add filter for testing purposes

    console.log('getReadingsData url:', uriReadings);

    const options = {
      method: 'GET',
      uri: uriReadings,
      json: true,
    };

    let readings: Array<Reading> = [];
    let legacyResources: Map<string, Resource> = null;
    let legacyGroups: Map<string, Group> = null;

    let batchSaveResults = [];
    const errors = [];
    const warnings: WarningType[] = [];

    return Promise.all([
      getLegacyMyWellResources(orgId, firestore),
      getLegacyMyWellGroups(orgId, firestore)
    ])
    .then(([_legacyResources, _legacyGroups]) => {
      legacyResources = _legacyResources;
      legacyGroups = _legacyGroups;
    })
    .then(() => request(options))
    .then((legacyReadings: Array<LegacyReading>) => {
      console.log(`found ${legacyReadings.length} legacyReadings`);
      
      console.log("example reading is", legacyReadings[0]);
      legacyReadings.forEach(r => {
        if (typeof r.value === undefined) {
          console.log("warning: found reading with no value", r);
          return;
        }

        //get metadata that didn't exist on original reading
        let resource: Resource;
        try {
          resource = findResourceMembershipsForResource(r, legacyResources);
        } catch (err) {
          warnings.push({ type: 'NoResourceMembership', message: err.message});
          return;
        }
        const externalIds: ResourceIdType = ResourceIdType.fromLegacyReadingId(r.id, r.postcode, r.resourceId);
        const groups: Map<string, boolean> = findGroupMembershipsForReading(r, legacyGroups);

        const createdAtMoment = moment(r.date);
        if (!createdAtMoment.isValid()) {
          // console.log(`WARNING: Invalid date for created at: ${r.date}`);
          warnings.push({ type:'MalformedDate', message: `Invalid date for created at: ${r.date}`});
          return;
        }

        //Only add readings from 2016 onwards
        // if (createdAtMoment.isBefore(moment("2017-01-01"))) {
          // return null;
        // } 

        const newReading: Reading = new Reading(orgId, resource.id, resource.coords, 
          resource.resourceType, groups, createdAtMoment.toDate(), r.value, externalIds);
        newReading.isLegacy = true; //set the isLegacy flag to true to skip updating the resource every time
        readings.push(newReading);
      });

      //batch save.
      const BATCH_SIZE = 500;
      const batches = chunkArray(readings, BATCH_SIZE);

      //Save one batch at a time
      return batches.reduce(async (arr: Promise<any>, curr: Reading[], idx) => {
        await arr;
        return fbApi.batchSaveReadings(curr)
          .then(results => {
            console.log(`SAVED BATCH ${idx} of ${batches.length}`);
            batchSaveResults = batchSaveResults.concat(results);
          })
          .catch(err => {
            console.log("batch save err:", err);
            return Promise.reject(err);
          })
      }, Promise.resolve(true))
    })
    .then(() => {
      return {
        results: [`Saved ${readings.length} readings`],
        warnings,
        errors,
      };
    })
    //Catch fatal errors here
    .catch(err => {
      console.log("getReadingsData error, ", err.message);

      return {
        results: [],
        warnings: [],
        errors: [err.message]
      };
    });
  }

  public async validate(orgId: string, firestore): Promise<SyncRunResult> {
    //TODO: restructure to return errors, warnings and results
    //TODO: get the api key and check that its valid
    throw new Error("validate not implemented for this data source");
  }


  public async pullDataFromDataSource(orgId: string, firestore, options: SyncDataSourceOptions) {
    //TODO: fix this to only pull specified data
    console.log("pull from data source", this.selectedDatatypes);
    let villageGroupResult = new DefaultSyncRunResult();
    let pincodeGroups = new DefaultSyncRunResult();
    let resources = new DefaultSyncRunResult();
    let readings = new DefaultSyncRunResult();

    if (this.selectedDatatypes.indexOf(DataType.Resource) > -1) {
      resources = await this.getResourcesData(orgId, firestore);
    }
    if (this.selectedDatatypes.indexOf(DataType.Reading) > -1) {
      readings = await this.getReadingsData(orgId, firestore);
    }
    if (this.selectedDatatypes.indexOf(DataType.Group) > -1) {
      villageGroupResult = await this.getGroupAndSave(orgId, firestore);
      pincodeGroups = await this.getPincodeData(orgId, firestore);
    }
   
    console.log("saving results");

    return concatSaveResults([
      villageGroupResult,
      pincodeGroups,
      resources,
      readings,
    ]);
  }

  /**
   * Get readings from OurWater that are eligible to be saved into LegacyMyWell
   * 
   * Filters based on the following properties:
   * - createdAt: when the reading was created (not the datetime of the reading), and
   * - externalIds.hasLegacyMyWellResourceId: a boolean flag indicating that the reading
   *     has a relationship to an external data source
   */
  public getNewReadings(orgId: string, firestore, filterAfterDate: number): Promise<Array<Reading>> {
    return firestore.collection('org').doc(orgId).collection('reading')
      .where('externalIds.hasLegacyMyWellResourceId', '==', true)
      .where('createdAt', '>=', filterAfterDate)
      //TODO: we need to set a maximum on this, and paginate properly
      .limit(50)
      .get()
      .then((sn) => {
        const readings: Array<Reading> = [];
        sn.forEach(doc => readings.push(Reading.deserialize(doc)))
        return readings;
      });
  }

  /**
   * Get resources from OurWater that are eligble to be saved into LegacyMyWell
   * 
   * A NEW resource is one that:
   * - has a pincode
   * - does not have a MyWellId, a villageId or resourceId
   * 
   */
  public getNewResources(orgId: string, firestore, filterAfterDate: number): Promise<Array<Resource>> {
    return firestore.collection('org').doc(orgId).collection('resource')
      .where('externalIds.hasLegacyMyWellPincode', '==', true)
      .where('externalIds.hasLegacyMyWellId', '==', false)
      .where('createdAt', '>=', filterAfterDate)
      .limit(50)
      .get()
      .then(sn => snapshotToResourceList(sn));
  }

  /* TODO: implement and use in addition to getNewResources.
  We're not too worried about updating resources at this stage

  public getUpdatedResources(orgId: string, firestore, filterAfterDate: number): Promise<Array<Resource>> {
    return firestore.collection('org').doc(orgId).collection('resource')
    //TODO: should we also check for isLegacy?
      .where('externalIds.hasLegacyMyWellId', '==', true)
      .where('createdAt', '>=', filterAfterDate)
      .limit(50).get()
      .then(sn => {
        const resources: Array<Resource> = [];
        sn.forEach(doc => resources.push(Resource.fromDoc(doc)));
        return resources;
      });
  }
  */
  

  public static transformReadingsToLegacyMyWell(readings: Array<Reading>): Array<LegacyMyWellReading> {

    return readings.map(reading => {
      return {
        date: moment(reading.datetime).toISOString(),
        value: reading.value,
        villageId: reading.externalIds.getVillageId(),
        postcode: reading.externalIds.getPostcode(),
        resourceId: reading.externalIds.getResourceId(),
        createdAt: moment(reading.createdAt).toISOString(),
        updatedAt: moment(reading.updatedAt).toISOString(),
      }
    });
  }

  public static transformResourcesToLegacyMyWell(resources: Array<Resource>): Array<LegacyResource> {

    return resources.map(resource => {

      return {
        postcode: resource.externalIds.getPostcode(),
        geo: {
          lat: resource.coords.latitude,
          lng: resource.coords.longitude,
        },
        last_value: resource.lastValue,
        //TODO: this may cause problems...
        last_date: moment(resource.lastReadingDatetime).toISOString(),
        owner: resource.owner.name,
        type: resource.resourceType,
        createdAt: moment(resource.createdAt).toISOString(),
        updatedAt: moment(resource.updatedAt).toISOString(),
        villageId: resource.externalIds.getVillageId(),
      }
    });
  }

  public saveReadingsToLegacyMyWell(readings: Array<LegacyMyWellReading>): Promise<SyncRunResult> {
    //TODO: Eventually make this a proper, mockable web client
    const uriReadings = `${this.baseUrl}/api/readings?access_token=${mywellLegacyAccessToken}`; //TODO: add filter for testing purposes

    const options = {
      method: 'POST',
      uri: uriReadings,
      json: true,
      body: readings
    };

    return request(options)
    .then((res: Array<LegacyMyWellReading>) => {
      const results = res.map(resource => resource.id);
      return {
        results,
        warnings: [],
        errors: [],
      };
    })
    .catch(err => resultWithError(err.message));
  }

  /**
   * Convert a list of SyncRunResults containing only one item each into a list of
   * nulls and ids
   */
  public static convertSyncRunResultsToList(results): Array<number> {    
    return results.map(result => result.results[0] ? result.results[0] : null);
  }

  /**
   * Save New resources to LegacyMyWell.
   * 
   * Saves them one at a time, and when the resources are saved, gets the resourceId and updates the 
   * External IDs on the OW side.
   * 
   */
  public async saveNewResourcesToLegacyMyWell(resources: Array<Resource>): Promise<Array<any>> {
    //TODO: enforce a resonable limit here?
    const legacyResources: Array<LegacyResource> = await LegacyMyWellDatasource.transformResourcesToLegacyMyWell(resources);

    return Promise.all(legacyResources.map(resource => {
      //If this dies, it will return a SyncRunResult with one error, and end up as a null below
      return this.saveResourcesToLegacyMyWell([resource])
    }))
    .then((results: Array<SyncRunResult>) => LegacyMyWellDatasource.convertSyncRunResultsToList(results));
  }

  /**
   * Given a list of ids or nulls, and a list of OW Resources, update the OW Resources to have
   * the correct external ids
   * 
   * //TODO: we assume that they will be in the same order. TODO: check this assumption!
   */
  public async updateExistingResources(resources: Array<Resource>, ids, firestore) {

    //Iterate through the newIds, and update OW resources to match
    return ids.reduce(async (acc: Promise<SyncRunResult>, curr: any, idx) => {
      const result = await acc;
      const owResource = resources[idx];
      if (curr === null) {
        result.warnings.push(`Failed to save resource with id:${owResource.id}.`);
        return Promise.resolve(result);
      }

      const pincode = owResource.externalIds.getPostcode();
      owResource.externalIds = ResourceIdType.fromLegacyMyWellId(pincode, curr);
      return owResource.save({ firestore })
      .then(() => result.results.push(curr))
      .catch((err) => result.errors.push(err.message))
      .then(() => result);

    }, Promise.resolve(new DefaultSyncRunResult()));
  }


  /**
   * Save a number of resources in bulk.
   * 
   * Use for updating a number of resources at a time. Don't use for creating new resources that don't have Ids yet.
   */
  public saveResourcesToLegacyMyWell(resources: Array<LegacyResource>): Promise<SyncRunResult> {
    //TODO: Eventually make this a proper, mockable web client
    const uriReadings = `${this.baseUrl}/api/resources?access_token=${mywellLegacyAccessToken}`; //TODO: add filter for testing purposes
    const options = {
      method: 'POST',
      uri: uriReadings,
      json: true,
      body: resources
    };

    return request(options)
      .then((res: Array<LegacyMyWellReading>) => {
        const results = res.map(resource => resource.id);
        return {
          results,
          warnings: [],
          errors: [],
        };
      })
      .catch(err => {
        console.log("ERROR saveResourcesToLegacyMyWell", err.message);
        return resultWithError(err.message)
      });
  }

  public async pushDataToDataSource(orgId: string, firestore, options: SyncDataSourceOptions): Promise<SyncRunResult> {
    let villageGroupResult = new DefaultSyncRunResult();
    let pincodeGroupResult = new DefaultSyncRunResult();
    let resourceResult = new DefaultSyncRunResult();
    let readingResult = new DefaultSyncRunResult();

    this.selectedDatatypes.forEach(async datatypeStr => {
    // await this.selectedDatatypes.forEach(async datatypeStr => {
      switch (datatypeStr) {
        case DataType.Reading:
          const readings: Array<Reading> = await this.getNewReadings(orgId, firestore, options.filterAfterDate);
          console.log(`pushDataToDataSource, found ${readings.length} new/updated readings`);
          const legacyReadings: Array<LegacyMyWellReading> = await LegacyMyWellDatasource.transformReadingsToLegacyMyWell(readings);
          readingResult = await this.saveReadingsToLegacyMyWell(legacyReadings);

          break;
        case DataType.Resource:
          const newResources: Array<Resource> = await this.getNewResources(orgId, firestore, options.filterAfterDate);
          console.log(`pushDataToDataSource, found ${newResources.length} new resources`);
          const ids = await this.saveNewResourcesToLegacyMyWell(newResources);
          resourceResult = await this.updateExistingResources(newResources, ids, firestore);
        break;
        // case DataType.Group:
        //   //TODO: Implement for both pincodes and villages? For now only pincodes
        //   const groups: Array<Group> = await this.getPincodeGroups(orgId, firestore, options.filterAfterDate);
        //   console.log(`pushDataToDataSource, found ${groups.length} new/updated pincode groups`);
        //   const legacyPincodes: Array<LegacyPincode>


        // break;
        default:
          throw new Error(`pullDataFromDataSource not implemented for DataType: ${datatypeStr}`);
      }

      return true;
    });

    return concatSaveResults([
      villageGroupResult,
      pincodeGroupResult,
      resourceResult,
      readingResult
    ]);
  }

  serialize() {
    return {
      baseUrl: this.baseUrl,
      type: this.type.toString(),
      selectedDatatypes: this.selectedDatatypes
    };
  }
}