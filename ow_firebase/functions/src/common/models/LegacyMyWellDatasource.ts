import Datasource, {ApiDatasource} from './Datasource';
import { DatasourceType } from '../enums/DatasourceType';
import * as request from 'request-promise-native';
import { Group } from './Group';
import { GeoPoint, Firestore } from '@google-cloud/firestore';
import * as moment from 'moment';

import { createDiamondFromLatLng } from '../utils';
import { lang, isMoment } from 'moment';
import LegacyVillage from '../types/LegacyVillage';
import { GroupType } from '../enums/GroupType';
import LegacyResource from '../types/LegacyResource';
import { resource } from '../..';
import { Resource } from './Resource';
import ResourceIdType from '../types/ResourceIdType';
import { ResourceType, resourceTypeFromString } from '../enums/ResourceType';
import ResourceOwnerType from '../types/ResourceOwnerType';
import { Reading } from './Reading';
import LegacyReading from '../types/LegacyReading';


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
        
        return new Group(village.name, orgId, GroupType.Village, coords);
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
        const villages: Array<LegacyVillage> = pincodeIds[pincode];
        //TODO: the only issue with this approach is that the coordinates aren't in order.
        const coords = villages.map(v => new GeoPoint(v.coordinates.lat, v.coordinates.lng));

        return new Group(pincode, orgId, GroupType.Pincode, coords);
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
    const uriResources = `${this.baseUrl}/api/resources`;

    const options = {
      method: 'GET',
      uri: uriResources,
      json: true,
    };

    let resources: Array<Resource> = [];

    return request(options)
    .then((legacyRes: Array<LegacyResource>) => {
      legacyRes.forEach(r => {
        const externalIds: ResourceIdType = ResourceIdType.fromLegacyMyWellId(r.postcode, r.id);
        const coords = new GeoPoint(r.geo.lat, r.geo.lng);
        const resourceType = resourceTypeFromString(r.type);
        const owner: ResourceOwnerType = {name: r.owner, createdByUserId: 'default'};

        const newResource: Resource = new Resource(orgId, externalIds, coords, resourceType, owner);
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

    //TODO: define new group relationships somehow (this will be tricky - I've had too much wine)
  }

  /**
   * Get all readings from MyWell
   * 
   * This also doesn't require pagination, but is expensive.
   * Perhaps we should test with just a small number of readings for now
   * 
   */
  public getReadingsData(orgId: string, fs: Firestore) {
    const uriReadings = `${this.baseUrl}/api/resources`; //TODO: add filter

    const options = {
      method: 'GET',
      uri: uriReadings,
      json: true,
    };

    let readings: Array<Reading> = null;

    //TODO: load a map of all saved resources, where key is the legacyId (pincode.resourceId)
    //This will enable us to easily map
    //We also need to have the groups first

    return request(options)
      .then((legacyReadings: Array<LegacyReading>) => {
        legacyReadings.forEach(r => {
          //TODO: add missing fields

          // const resourceType = resourceTypeFromString(r);
          const newReading: Reading = new Reading(orgId, null, null, null, null, moment(r.createdAt).toDate(), r.value);
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

  public async pullDataFromDataSource(orgId: string, fs) {
    // const villageGroups = await this.getGroupData(orgId, fs);
    // const pincodeGroups = await this.getPincodeData(orgId, fs)
    const resources = await this.getResourcesData(orgId, fs);
    // const readings = await this.getReadingsData(orgId, fs);

    return {
      // groups: [],
      resources,
      // readings
    };
  }

  public pushDataToDataSource() {
    console.log("Implementation not required. MyWell Data source is readonly for now.");

    return true;
  }

  serialize() {
    return {
      baseUrl: this.baseUrl,
      type: this.type.toString(),
    };
  }
}