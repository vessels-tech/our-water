import {ApiDatasource} from './Datasource';
import { DatasourceType } from '../enums/DatasourceType';

export default class LegacyMyWellDatasource extends ApiDatasource {

  constructor(baseUrl: string) {
    super(baseUrl);
    this.type = DatasourceType.LegacyMyWellDatasource;
  }

  /**
   * Iterates through pincodes and villages from MyWell datasource
   * 
   * As villages don't have 
   * 
   */
  public getGroupData() {
    const uriVillage = `${this.baseUrl}/villages`;

    //Get villages using simple get request
    //convert villages into groups
    //return groups

    //TODO: I'm not sure how we will get pincodes. Perhaps they need to be manual for now

    return [];
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
}