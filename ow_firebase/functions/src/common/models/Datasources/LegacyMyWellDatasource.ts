import Datasource from './Datasource';
import { DatasourceType } from '../../enums/DatasourceType';
import * as request from 'request-promise-native';
import { Group } from '../Group';
import OWGeoPoint from '../../models/OWGeoPoint';
import * as moment from 'moment';

import { createDiamondFromLatLng, findGroupMembershipsForResource, getLegacyMyWellGroups, getLegacyMyWellResources, findResourceMembershipsForResource, findGroupMembershipsForReading, concatSaveResults, resultWithError, resourceIdForResourceType, hashIdToIntegerString, snapshotToResourceList } from '../../utils';
import LegacyVillage from '../../types/LegacyVillage';
import { GroupType } from '../../enums/GroupType';
import LegacyResource from '../../types/LegacyResource';
import { Resource } from '../Resource';
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


export default class LegacyMyWellDatasource implements Datasource {
  baseUrl: string
  type: DatasourceType
  selectedDatatypes: Array<string>;

  public static defaultPostcode = 11111;

  /**
   * We are using an int(11) on the MySQL table - 
   * perhaps we can can generate a resource id for the 
   * corresponding resource type, and append this to a 
   * hash of the Resource.id.
   *
   *   such that:
   *   ```
   *   source: [villageId][resourceId][hash(id)]
   *   length: 2          2            6
   *   ```
   */
  public static generateLegacyResourceId(resourceType: ResourceType, id: string): number {
    const villageIdStr = 11;
    const resourceIdStr = resourceIdForResourceType(resourceType);
    const hashedId = hashIdToIntegerString(id, 6);

    return parseInt(villageIdStr + resourceIdStr + hashedId);
  }


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

  public saveGroups(orgId, fs, groups: Array<Group>): Promise<GroupSaveResult> {
    const errors = [];
    const savedGroups: Group[] = [];

    return Promise.all(
      groups.map(group => {
        return group.create({ fs })
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
  
  public async getGroupAndSave(orgId: string, fs): Promise<GroupSaveResult>  {
    const legacyVillages: Array<LegacyVillage> = await this.getGroupData();
    const newGroups: Array<Group> = LegacyMyWellDatasource.transformLegacyVillagesToGroups(orgId, legacyVillages);
    
    return await this.saveGroups(orgId, fs, newGroups);
  }

  /**
   * Create groups based on inferred pincode data
   * 
   */  
  public getPincodeData(orgId: string, fs): Promise<GroupSaveResult> {
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
        return group.create({fs})
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
  public getResourcesData(orgId: string, fs): Promise<ResourceSaveResult> {
    // const uriResources = `${this.baseUrl}/api/resources?filter=%7B%22where%22%3A%7B%22resourceId%22%3A1110%7D%7D`;
    const uriResources = `${this.baseUrl}/api/resources`;

    const options = {
      method: 'GET',
      uri: uriResources,
      json: true,
    };

    let resources: Array<Resource> = [];
    let legacyGroups = null;
    return getLegacyMyWellGroups(orgId, fs)
    .then(_legacyGroups => legacyGroups = _legacyGroups)
    .then(() => request(options))
    .then((legacyRes: Array<LegacyResource>) => {
      legacyRes.forEach(r => {
        const externalIds: ResourceIdType = ResourceIdType.fromLegacyMyWellId(r.postcode, r.id);
        const coords = new OWGeoPoint(r.geo.lat, r.geo.lng);
        const resourceType = resourceTypeFromString(r.type);
        const owner: ResourceOwnerType = {name: r.owner, createdByUserId: 'default'};
        const groups: Map<string, boolean> = findGroupMembershipsForResource(r, legacyGroups);

        const newResource: Resource = new Resource(orgId, externalIds, coords, resourceType, owner, groups);
        newResource.lastReadingDatetime = moment(r.last_date).toDate();
        newResource.lastValue = r.last_value;
        resources.push(newResource);
      });

      let errors = [];
      let savedResources: Array<Resource> = [];
      resources.forEach(res => {
        return res.create({ fs })
          .then((savedRes: Resource) => savedResources.push(savedRes))
          .catch(err => errors.push(err));
      });

      return {
        results: savedResources,
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
   */
  public getReadingsData(orgId: string, fs): Promise<ReadingSaveResult>  {
    const uriReadings = `${this.baseUrl}/api/readings?access_token=${mywellLegacyAccessToken}`; //TODO: add filter for testing purposes
    // const uriReadings = `${this.baseUrl}/api/resources`;

    const options = {
      method: 'GET',
      uri: uriReadings,
      json: true,
    };

    let readings: Array<Reading> = [];
    let legacyResources = null;
    let legacyGroups = null;

    //TODO: load a map of all saved resources, where key is the legacyId (pincode.resourceId)
    //This will enable us to easily map
    //We also need to have the groups first

    return Promise.all([
      getLegacyMyWellResources(orgId, fs),
      getLegacyMyWellGroups(orgId, fs)
    ])
    .then(([_legacyResources, _legacyGroups]) => {
      legacyResources = _legacyResources;
      legacyGroups = _legacyGroups;
    })
    .then(() => request(options))
    .then((legacyReadings: Array<LegacyReading>) => {
      let errors = [];
      let warnings = [];
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
          warnings.push(err.message);
          return;
        }
        const externalIds: ResourceIdType = ResourceIdType.fromLegacyReadingId(r.id, r.postcode, r.resourceId);
        const groups: Map<string, boolean> = findGroupMembershipsForReading(r, legacyGroups);

        const newReading: Reading = new Reading(orgId, resource.id, resource.coords, 
          resource.resourceType, groups, moment(r.createdAt).toDate(), r.value, externalIds);
        newReading.isLegacy = true; //set the isLegacy flag to true to skip updating the resource every time
        readings.push(newReading);
      });

      let savedReadings: Array<Reading> = [];
      readings.forEach(res => {
        return res.create({ fs })
          .then((savedRes: Reading) => savedReadings.push(savedRes))
          .catch(err => errors.push(err));
      });

      return {
        results: savedReadings,
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

  public async validate(orgId: string, fs): Promise<SyncRunResult> {
    //TODO: restructure to return errors, warnings and results
    //TODO: get the api key and check that its valid
    throw new Error("validate not implemented for this data source");
  }

  public async pullDataFromDataSource(orgId: string, fs, options: SyncDataSourceOptions): Promise<SyncRunResult> {
    let villageGroupResult = new DefaultSyncRunResult();
    let pincodeGroups = new DefaultSyncRunResult();
    let resources = new DefaultSyncRunResult();
    let readings = new DefaultSyncRunResult();

    await this.selectedDatatypes.forEach(async datatypeStr => {
      switch(datatypeStr) {
        case DataType.Resource: 
          resources = await this.getResourcesData(orgId, fs);
        break;
        case DataType.Reading:
          readings = await this.getReadingsData(orgId, fs);
        break;
        case DataType.Group: 
          villageGroupResult = await this.getGroupAndSave(orgId, fs);
          pincodeGroups = await this.getPincodeData(orgId, fs)
        break;
        default:
          throw new Error(`pullDataFromDataSource not implemented for DataType: ${datatypeStr}`);
      }
    });

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
  public getNewReadings(orgId: string, fs, filterAfterDate: number): Promise<Array<Reading>> {
    return fs.collection('org').doc(orgId).collection('reading')
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
   * TODO: how do we prevent an infinite loop here?
   * 
   */
  public getNewResources(orgId: string, fs, filterAfterDate: number): Promise<Array<Resource>> {
    return fs.collection('org').doc(orgId).collection('resource')
    //TODO: should we also check for isLegacy?
      .where('externalIds.hasLegacyMyWellId', '==', true)
      .where('createdAt', '>=', filterAfterDate)
      .limit(50).get()
      .then(sn => snapshotToResourceList(sn));
  }

  /* TODO: implement and use in addition to getNewResources.
  We're not too worried about updating resources at this stage

  public getNewResources(orgId: string, fs, filterAfterDate: number): Promise<Array<Resource>> {
    return fs.collection('org').doc(orgId).collection('resource')
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
      let id, postcode;
      //If the resource was originally from LegacyMyWell, this allows us to update it
      if (resource.externalIds.hasLegacyMyWellId) {
        id = resource.externalIds.getResourceId();
        postcode = resource.externalIds.getPostcode();
      } else {
        //Generate our own Ids, 

      }

      return {
        id,
        postcode,
        geo: {
          lat: resource.coords._latitude,
          lng: resource.coords._longitude,
        },
        last_value: resource.lastValue,
        last_date: resource.lastReadingDatetime.toISOString(),
        owner: resource.owner.name,
        type: resource.resourceType,
        createdAt: resource.createdAt.toISOString(),
        updatedAt: resource.updatedAt.toISOString(),
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

  public saveResourcesToLegacyMyWell(resources: Array<LegacyResource>): Promise<SyncRunResult> {
    //TODO: Eventually make this a proper, mockable web client
    const uriReadings = `${this.baseUrl}/api/resources?access_token=${mywellLegacyAccessToken}`; //TODO: add filter for testing purposes
    const options = {
      method: 'POST',
      uri: uriReadings,
      json: true,
      body: resources
    };

    //TODO: filter out resources we think will fail, add to warinings

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

  public async pushDataToDataSource(orgId: string, fs, options: SyncDataSourceOptions): Promise<SyncRunResult> {
    let villageGroupResult = new DefaultSyncRunResult();
    let pincodeGroupResult = new DefaultSyncRunResult();
    let resourceResult = new DefaultSyncRunResult();
    let readingResult = new DefaultSyncRunResult();

    await this.selectedDatatypes.forEach(async datatypeStr => {
      switch (datatypeStr) {
        case DataType.Reading:
          const readings: Array<Reading> = await this.getNewReadings(orgId, fs, options.filterAfterDate);
          console.log(`pushDataToDataSource, found ${readings.length} new/updated readings`);
          const legacyReadings: Array<LegacyMyWellReading> = await LegacyMyWellDatasource.transformReadingsToLegacyMyWell(readings);
          readingResult = await this.saveReadingsToLegacyMyWell(legacyReadings);

          break;
        case DataType.Resource:
          const resources: Array<Resource> = await this.getNewResources(orgId, fs, options.filterAfterDate);
          console.log(`pushDataToDataSource, found ${resources.length} new/updated resources`);
          const legacyResources: Array<LegacyResource> = await LegacyMyWellDatasource.transformResourcesToLegacyMyWell(resources);
          resourceResult = await this.saveResourcesToLegacyMyWell(legacyResources);
        break;
        // case DataType.Group:
        //   //TODO: Implement for both pincodes and villages? For now only pincodes
        //   const groups: Array<Group> = await this.getPincodeGroups(orgId, fs, options.filterAfterDate);
        //   console.log(`pushDataToDataSource, found ${groups.length} new/updated pincode groups`);
        //   const legacyPincodes: Array<LegacyPincode>


        // break;
        default:
          throw new Error(`pullDataFromDataSource not implemented for DataType: ${datatypeStr}`);
      }
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
    };
  }
}