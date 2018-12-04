import Datasource from "./Datasource";
import { DatasourceType } from "../../enums/DatasourceType";
import SyncRunResult from "../../types/SyncRunResult";
import { DataType, FileFormat } from "../../enums/FileDatasourceTypes";
import FileDatasourceOptions from "../FileDatasourceOptions";
import * as Papa from 'papaparse';
import { downloadAndParseCSV, findResourceMembershipsForResource, resourceTypeForLegacyResourceId, isNullOrEmpty, chunkArray, hashReadingId, getLegacyMyWellResources } from "../../utils";
import FirestoreDoc from "../FirestoreDoc";
import { Reading } from "../Reading";
import * as moment from 'moment';
import ResourceIdType from "../../types/ResourceIdType";
import { Resource } from "../Resource";
import { firestore } from "firebase-functions";
import * as admin from "firebase-admin";
import { OWGeoPoint } from "ow_types";
import FirebaseApi from "../../apis/FirebaseApi";

const parseDateForgivingly = (dateStr): moment.Moment => {
  let date: moment.Moment;

  date = moment(dateStr, ['YYYY/MM/DD', 'DD/MM/YYYY']);
  if (!date.isValid()) {
    // if (!format) {
    //   return parseDateForgivingly(dateStr, 'DD/MM/YYYY');
    // }
    return null;
  }


  return date;
}

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


  convertReadingsAndMap(orgId: string, rows: any, dataType: DataType, resources: Map<string, Resource>, options: FileDatasourceOptions): Array<Reading>{
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
            // console.log("Found row with missing data:", row);
            return null;
          }

          const date = parseDateForgivingly(dateStr);
          if (!date) {
            console.log("Row has invalid date:", row, dateStr);
            return null;
          }

          const legacyId = `${pincode}.${legacyResourceId}`;
          const resource = resources.get(legacyId);
          if (!resource) {
            console.log("No resource found for legacyId:", legacyId);
            return null;
          }

          // let resourceId: string;
          // let coords: OWGeoPoint;

          const resourceType = resourceTypeForLegacyResourceId(legacyResourceId);
          const newReading: Reading = Reading.legacyReading(
            orgId, 
            resource.id,
            resource.coords,
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
    let legacyResources;

    //TODO: return this
    return getLegacyMyWellResources(orgId, fs)
    .then(_legacyResources => legacyResources = _legacyResources)
    .then(() => downloadAndParseCSV(this.fileUrl))
    .then(rows => this.convertReadingsAndMap(orgId, rows, this.dataType, legacyResources, this.options))
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


  /**
   * 
   * download the file to local
   * deserialize based on some settings
   * if no errors,
   *   Save the rows in a batch job
   *   run a batch job which adds group and resource metadata to readings
   */
  pullDataFromDataSource(orgId: string, fs: admin.firestore.Firestore): Promise<SyncRunResult> {
    let result = {
      results: [],
      warnings: [],
      errors: []
    };

    let legacyResources;
    let batchSaveResults = [];
    
    return getLegacyMyWellResources(orgId, fs)
    .then(_legacyResources => legacyResources = _legacyResources)
    .then(() => downloadAndParseCSV(this.fileUrl))
    .then(rows => this.convertReadingsAndMap(orgId, rows, this.dataType, legacyResources, this.options))
    .then(modelsAndNulls => {
      const models = modelsAndNulls.filter(model => model !== null);
      const nulls = modelsAndNulls.filter(model => model === null);
      result.results = [`Validated ${models.length} readings.`];
      result.warnings = [`A total of ${nulls.length} readings were invalid or missing data, and filtered out.`];

      //batch save.
      const BATCH_SIZE = 250;
      const batches = chunkArray(models, BATCH_SIZE);

      //Save one batch at a time
      return batches.reduce(async (arr: Promise<any>, curr: Reading[]) => {
        await arr;
        return FirebaseApi.batchSave(fs, curr).then(results => batchSaveResults = batchSaveResults.concat(results))
      }, Promise.resolve(true));
    })
    .then(() => {
      const totalSaved = batchSaveResults.length;
      result.results.push(`Batch saved a total of of ${totalSaved} readings.`);
      return result;
    })
    .catch((err: Error) => {
      console.log('pullDataFromDataSource error: ', err.message);
      return Promise.reject(err);
    });
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