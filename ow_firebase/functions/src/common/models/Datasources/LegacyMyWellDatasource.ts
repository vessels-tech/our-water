import Datasource from './Datasource';
import { DatasourceType } from '../../enums/DatasourceType';
import * as request from 'request-promise-native';
import { Group } from '../Group';
import { GeoPoint, Firestore } from '@google-cloud/firestore';
import * as moment from 'moment';

import { createDiamondFromLatLng, findGroupMembershipsForResource, getLegacyMyWellGroups, getLegacyMyWellResources, findResourceMembershipsForResource } from '../../utils';
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


export default class LegacyMyWellDatasource implements Datasource {
  baseUrl: string
  type: DatasourceType;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.type = DatasourceType.LegacyMyWellDatasource;
  }

 
  /**
   * Iterates through pincodes and villages from MyWell datasource
   * 
   * As villages have only a single point, we create our own
   * imaginary bounding box for the new group
   * 
   */
  public getGroupData(orgId: string, fs): Promise<Array<Group>> {
    // https://mywell-server.vessels.tech/api/villages
    const uriVillage = `${this.baseUrl}/api/villages`;

    const options = {
      method: 'GET',
      uri: uriVillage,
      json: true,
    };

    return request(options)
    .then((villages: Array<LegacyVillage>) => {
      //TODO: save using bulk method
      const newGroups = villages.map(village => {
        const coords: Array<GeoPoint> = createDiamondFromLatLng(village.coordinates.lat, village.coordinates.lat, 0.1);
        const externalIds = new Map<string, boolean>();
        externalIds.set(`mywell.${village.postcode}.${village.id}`, true);
        
        return new Group(village.name, orgId, GroupType.Village, coords, externalIds);
      });

      const errors = [];
      const savedGroups = [];
      newGroups.forEach(group => {
        return group.create({ fs })
          .then(savedGroup => {
            savedGroups.push(savedGroup);
          })
          .catch(err => {
            console.log('error saving new group', err);
            errors.push(err);
          });

      })

      //TODO: return errors as well
      return savedGroups;
    });

   
    //TODO: get pincodes by inferring from above villages. Draw coords from centre of each village

  }

  /**
   * Create groups based on inferred pincode data
   * 
   */  
  public getPincodeData(orgId: string, fs: Firestore): Promise<Array<Group>> {
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
        const coords = legacyVillages.map(v => new GeoPoint(v.coordinates.lat, v.coordinates.lng));
        const externalIds = new Map<string, boolean>();
        externalIds.set(`mywell.${pincode}`, true);

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

      return pincodeGroups;
    });    
  }


  /**
   * get all resources from MyWell
   * 
   * This doesn't require pagination, so we won't bother implementing it yet.
   * convert legacy MyWell resources into OW resources
   * return
   */
  public getResourcesData(orgId: string, fs: Firestore): Promise<Array<Resource>> {
    const uriResources = `${this.baseUrl}/api/resources?filter=%7B%22where%22%3A%7B%22resourceId%22%3A1110%7D%7D`;
    // const uriResources = `${this.baseUrl}/api/resources`;

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
        const coords = new GeoPoint(r.geo.lat, r.geo.lng);
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

      return savedResources;
    });
  }

  /**
   * Get all readings from MyWell
   * 
   * This also doesn't require pagination, but is expensive.
   * Perhaps we should test with just a small number of readings for now
   * 
   */
  public getReadingsData(orgId: string, fs: Firestore) {
    const token = 'FkhEG7gl7WctHe43KJxMqLOal1Wpgev6sbVCHbJe8taBZZzrpzFDKZCmVhhjJC4d'; //TODO: not sure why we need this
    const uriReadings = `${this.baseUrl}/api/readings?filter=%7B%22where%22%3A%7B%22resourceId%22%3A1110%7D%7D&access_token=${token}`; //TODO: add filter for testing purposes
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

    return getLegacyMyWellResources(orgId, fs)
    .then(_legacyResources => legacyResources)
    .then(() => request(options))
    .then((legacyReadings: Array<LegacyReading>) => {
      legacyReadings.forEach(r => {
        if (typeof r.value === undefined) {
          console.log("warning: found reading with no value", r);
          return;
        }
        //TODO: add group field
        const resource: Resource = findResourceMembershipsForResource(r, legacyResources);
        const externalIds: ResourceIdType = ResourceIdType.fromLegacyReadingId(r.id);
        resource.externalIds = externalIds;

        const newReading: Reading = new Reading(orgId, resource.id, resource.coords, resource.resourceType, null, moment(r.createdAt).toDate(), r.value);
        newReading.isLegacy = true; //set the isLegacy flag to true to skip updating the resource every time
        readings.push(newReading);
      });

      let errors = [];
      let savedReadings: Array<Reading> = [];
      readings.forEach(res => {
        return res.create({ fs })
          .then((savedRes: Reading) => savedReadings.push(savedRes))
          .catch(err => errors.push(err));
      });

      return savedReadings;
    });

  }

  public async pullDataFromDataSource(orgId: string, fs): Promise<SyncRunResult> {
    //TODO: restructure to return errors, warnings and results
    const villageGroups = await this.getGroupData(orgId, fs);
    const pincodeGroups = await this.getPincodeData(orgId, fs)
    const resources = await this.getResourcesData(orgId, fs);
    const readings = await this.getReadingsData(orgId, fs);

    //TODO: return proper SyncRunResult
    const result = {
      results: [],
      warnings: [],
      errors: []
    }
    return result;
  }

  public pushDataToDataSource(): Promise<SyncRunResult> {
    console.log("Implementation not required. MyWell Data source is readonly for now.");

    const result = {
      results: [],
      warnings: [],
      errors: []
    }
    return Promise.resolve(result);
  }

  serialize() {
    return {
      baseUrl: this.baseUrl,
      type: this.type.toString(),
    };
  }
}