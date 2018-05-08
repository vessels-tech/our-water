import Datasource from "./Datasource";
import { DatasourceType } from "../../enums/DatasourceType";
import SyncRunResult from "../../types/SyncRunResult";
import { DataType, FileFormat } from "../../enums/FileDatasourceTypes";
import FileDatasourceOptions from "../FileDatasourceOptions";
import * as Papa from 'papaparse';
import { downloadAndParseCSV, findResourceMembershipsForResource, resourceTypeForLegacyResourceId } from "../../utils";
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
          if (options.hasHeaderRow && idx === 0) {
            return null;
          }

          //TODO: support other formats
          let [dateStr, pincode, legacyResourceId, valueStr] = row;
          const resourceType = resourceTypeForLegacyResourceId(legacyResourceId);
          const newReading: Reading = Reading.legacyReading(
            orgId, 
            resourceType,
            moment(dateStr).toDate(),
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
    downloadAndParseCSV(this.fileUrl)
    .then(rows => {
      const modelsToSave = this.convertRowsToModels(orgId, rows, this.dataType, this.options);
      console.log("models to save are", modelsToSave);
    })

    

    return null;
  }

  pullDataFromDataSource(orgId: string, fs): Promise<SyncRunResult> {
    //download the file to local
    //deserialize based on some settings

    return null
  }

  pushDataToDataSource(): Promise<SyncRunResult> {
    return null;
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