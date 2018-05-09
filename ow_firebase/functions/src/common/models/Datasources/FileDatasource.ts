import Datasource from "./Datasource";
import { DatasourceType } from "../../enums/DatasourceType";
import SyncRunResult from "../../types/SyncRunResult";
import { DataType, FileFormat } from "../../enums/FileDatasourceTypes";
import FileDatasourceOptions from "../FileDatasourceOptions";
import * as Papa from 'papaparse';
import { downloadAndParseCSV, findResourceMembershipsForResource, resourceTypeForLegacyResourceId, isNullOrEmpty } from "../../utils";
import FirestoreDoc from "../FirestoreDoc";
import { Reading } from "../Reading";
import * as moment from 'moment';
import ResourceIdType from "../../types/ResourceIdType";
import { Resource } from "../Resource";

/**
 * Defines a datasource which parses information from a file
 * for now, we will implement readings only, but eventually
 * we may want to subclass this and specialize further or something
 * 
 * When a user defines this class, they will put in a file location, as well
 * as a type of file - e.g. readings, resource or group. We will implement readings first
 * The user can also put in settings, such as file type (csv, xlsx), and separator type (comma, tab)
 * and whether or not is uses legacyMyWellIds or ourwater ids
 * 
 * In order to check the format of the file, user can run the sync with a validateOnly option 
 *
 */
export class FileDatasource implements Datasource {
  type = DatasourceType.FileDatasource;

  fileUrl: string;
  dataType: DataType;
  fileFormat: FileFormat;
  options: FileDatasourceOptions;

  constructor(fileUrl: string, dataType: DataType, 
  fileFormat: FileFormat, options: FileDatasourceOptions) {
    this.fileUrl = fileUrl;
    this.dataType = dataType;
    this.fileFormat = fileFormat;
    this.options = options;
  }

  //TODO: move elsewhere
  convertRowsToModels(orgId: string, rows: any, dataType: DataType, options: FileDatasourceOptions): Array<FirestoreDoc>{

    switch(dataType) {
      case DataType.Reading:
        if (!options.usesLegacyMyWellIds) {
          throw new Error('only legacy readings implemented for the Reading DataType');
        } 

        return rows.map((row, idx) => {
          if (options.includesHeadings && idx === 0) {
            return null;
          }

          //TODO: support other row orders
          let [dateStr, pincode, legacyResourceId, valueStr] = row;
          if (isNullOrEmpty(dateStr) ||
              isNullOrEmpty(pincode) ||
              isNullOrEmpty(legacyResourceId) ||
              isNullOrEmpty(valueStr)
          ) {
            console.log("Found row with missing data:", row);
            return null;
          }

          const date = moment(dateStr);
          if (!date.isValid()) {
            console.log("Row has invalid date:", row, dateStr);
            return null;
          }

          const resourceType = resourceTypeForLegacyResourceId(legacyResourceId);
          const newReading: Reading = Reading.legacyReading(
            orgId, 
            resourceType,
            date.toDate(),
            Number(valueStr), 
            ResourceIdType.fromLegacyReadingId(null, pincode, legacyResourceId)
          );

          return newReading;
        });

      case DataType.Group:
      case DataType.Resource:
      default:
        throw new Error('ConvertRowsToModels not yet implemented for these DataTypes')
    }
  }

  validate(orgId: string, fs): Promise<SyncRunResult> {
    //Download the file to local
    //parse and don't save

    //TODO: return this
    return downloadAndParseCSV(this.fileUrl)
    .then(rows => this.convertRowsToModels(orgId, rows, this.dataType, this.options))
    .then(modelsAndNulls => {
      const models = modelsAndNulls.filter(model => model !== null);
      const nulls = modelsAndNulls.filter(model => model === null);

      const result = {
        results: [`Validated ${models.length} readings.`],
        warnings: [`A total of ${nulls.length} readings were invalid or missing data, and filtered out.`],
        errors: []
      }
      return result;
    })
    .catch(err => {
      return {
        results: [],
        warnings: [],
        errors: [err]
      }
    });
  }

  pullDataFromDataSource(orgId: string, fs): Promise<SyncRunResult> {
    //download the file to local
    //deserialize based on some settings
    //if no errors, 
    //  Save the rows in a batch job
    //  run a batch job which adds group and resource metadata to readings

    let result = {
      results: [],
      warnings: [],
      errors: []
    };
    //TODO: return this
    downloadAndParseCSV(this.fileUrl)
    .then(rows => this.convertRowsToModels(orgId, rows, this.dataType, this.options))
    .then(modelsAndNulls => {
      const models = modelsAndNulls.filter(model => model !== null);
      const nulls = modelsAndNulls.filter(model => model === null);
      
      result.results = [`Validated ${models.length} readings.`];
      result.warnings = [`A total of ${nulls.length} readings were invalid or missing data, and filtered out.`];

      //TODO: batch save

    });

    
    return Promise.resolve(result);  
  }

  pushDataToDataSource(): Promise<SyncRunResult> {
    throw new Error("not implemented for this datasource");
  }

  serialize() {
    return {
      fileUrl: this.fileUrl,
      dataType: this.dataType,
      options: this.options.serialize(),
      type: this.type.toString(),
    };
  }
}