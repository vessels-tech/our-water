import Datasource, {ApiDatasource} from './Datasource';
import { DatasourceType } from '../enums/DatasourceType';
import * as request from 'request-promise-native';
import { Group } from './Group';

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
   * As villages don't have 
   * 
   */
  public getGroupData(): Promise<Array<Group>> {
    const uriVillage = `${this.baseUrl}/villages`;

    const options = {
      method: 'GET',
      uri: uriVillage,
      json: true,
    };

    return request(options)
    .then(villages => {
      console.log("villages", villages);

      //TODO: convert into groups in bulk

      return [];
    });

   

    //TODO: I'm not sure how we will get pincodes. Perhaps they need to be manual for now
  }


  /**
   * get all resources from MyWell
   * 
   * This doesn't require pagination, so we won't bother implementing it yet.
   * convert legacy MyWell resources into OW resources
   * return
   */
  public getResourcesData() {
    const uriResources = `${this.baseUrl}/resources`;

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

  public async pullDataFromDataSource() {
    const groups = await this.getGroupData();
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