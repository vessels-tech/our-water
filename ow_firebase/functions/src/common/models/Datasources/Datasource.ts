
import LegacyMyWellDatasource from './LegacyMyWellDatasource';
import { DatasourceType } from '../../enums/DatasourceType';
import SyncRunResult from '../../types/SyncRunResult';


export const deserializeDatasource = (ser) => {
  //TODO: this is kinda crappy
  //Deserialize based on type somehow

  return new LegacyMyWellDatasource(ser.baseUrl);
}

export default interface Datasource {
  type: DatasourceType

  pullDataFromDataSource(orgId: string, fs): Promise<SyncRunResult>;
  pushDataToDataSource(): Promise<SyncRunResult>;

  serialize();  
}
