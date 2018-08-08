
import LegacyMyWellDatasource from './LegacyMyWellDatasource';
import { DatasourceType } from '../../enums/DatasourceType';
import SyncRunResult from '../../types/SyncRunResult';
import { FileDatasource } from './FileDatasource';
import SyncDataSourceOptions from '../../types/SyncDataSourceOptions';


export const deserializeDatasource = (ser) => {

  switch(ser.type) {
    case DatasourceType.LegacyMyWellDatasource:
      return new LegacyMyWellDatasource(ser.baseUrl, ser.selectedDatatypes);
    case DatasourceType.FileDatasource:
      return new FileDatasource(ser.fileUrl, ser.dataType, ser.fileFormat, ser.options);
    default: 
      throw new Error(`Tried to deserialize datasource of type: ${ser.type}`);
  }
}

export default interface Datasource {
  type: DatasourceType

  validate(orgId: string, fs): Promise<SyncRunResult>;
  pullDataFromDataSource(orgId: string, fs, options: SyncDataSourceOptions): Promise<SyncRunResult>;
  pushDataToDataSource(orgId: string, fs, options: SyncDataSourceOptions): Promise<SyncRunResult>;

  //We never need to save this directly, but the Sync does get saved
  serialize();  
}
