
import LegacyMyWellDatasource from './LegacyMyWellDatasource';
import { DatasourceType } from '../enums/DatasourceType';


export const deserializeDatasource = (ser) => {
  //TODO: this is kinda crappy
  //Deserialize based on type somehow

  return new LegacyMyWellDatasource(ser.baseUrl);
}

export default interface Datasource {
  type: DatasourceType

  pullDataFromDataSource();
  pushDataToDataSource();

  serialize();  
}

export class ApiDatasource implements Datasource {
  type: DatasourceType;
  baseUrl: string;

  constructor( baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  pullDataFromDataSource() {
    return null;
  }

  pushDataToDataSource() {
    return null;
  }

  serialize() {
    return {
      type: this.type.toString(),
      baseUrl: this.baseUrl,
    }
  }

}
