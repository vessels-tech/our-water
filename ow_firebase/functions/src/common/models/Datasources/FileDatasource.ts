import Datasource from "./Datasource";
import { DatasourceType } from "../../enums/DatasourceType";
import SyncRunResult from "../../types/SyncRunResult";

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
  fileUrl: string;
  dataType: string; //TODO: define
  options: any; //TODO: define


  type = DatasourceType.FileDatasource;

  constructor(fileUrl: string, dataType: string, options) {
    this.fileUrl = fileUrl;
    this.dataType = dataType;
  }

  validate(orgId: string, fs): Promise<SyncRunResult> {
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
      options: this.options,
      type: this.type.toString(),
    };
  }
}