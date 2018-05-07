import Datasource, {ApiDatasource} from './Datasource';
import { DatasourceType } from '../enums/DatasourceType';
import * as request from 'request-promise-native';
import { Group } from './Group';
import { GeoPoint, Firestore } from '@google-cloud/firestore';

import { createDiamondFromLatLng } from '../utils';
import { lang } from 'moment';
import LegacyVillage from '../types/LegacyVillage';
import { GroupType } from '../enums/GroupType';
import { Resource } from 'firebase-functions';
import LegacyResource from '../types/LegacyResource';
import { resource } from '../..';


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
        const groupList = pincodeIds[v.postcode] || [];
        groupList.append(v);
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
        .catch(err => errors.push(err));
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
  public getResourcesData() {
    const uriResources = `${this.baseUrl}/api/resources`;

    const options = {
      method: 'GET',
      uri: uriResources,
      json: true,
    };

    let resources: Array<Resource> = null;

    return request(options)
    .then((resources: Array<LegacyResource>) => {
      resources.forEach(r => {
        const newResource: Resource = new Resource
      })
    })


    //GET resources
    //convert legacy MyWell resources into OW resources
    //define new group relationships somehow (this will be tricky)
    //return

    return [];
  }

  /**
   * Get all readings from MyWell
   * 
   * This also doesn't require pagination
   * 
   */
  public getReadingsData() {

    //GET readings
    //convert legacy MyWell Readings to OW readings
    //return
    return [];
  }

  public async pullDataFromDataSource(orgId: string, fs) {
    const groups = await this.getGroupData(orgId, fs);
    const resources = await this.getResourcesData();
    const readings = await this.getReadingsData();

    return {
      groups,
      resources,
      readings
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