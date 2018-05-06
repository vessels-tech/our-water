

The Sync API provides a way for OurWater to:
1. Pull data in from other sources, and
2. Push data to other systems



For a given Organisation, a user can add a sync data source 



## Datasources:

A datasource can have multiple types, for example an SQL Data source, a CSV data source, or an API data source.


A user creates a sync, and selects the data source type. A Sync can be one or more of:
- push data from DS to OW
- pull data from OW to DS
- push data from OW to DS
- pull data from DS to OW


The flow might look like the following:
1. user creates a Sync for organisation MyWell. This sync is configured as a `pull data from DS`, as a one time sync.
2. user then hits the endpoint: `https://ow.vessels.tech/api/functions/sync/:syncId
3. This fires a firebase function, which requests the data from the specified datasource, ensures the correct 

or

1. user uploads a csv file to cloud storage
2. user creates a sync with a datasource pointing to this file
3. user triggers this sync 



## Models:

```js
class Sync {

 isOneTime: true,
 datasource: new ApiDataSource('https://mywell-server.vessels.tech'),
 orgId: 'mywellId',
 type: SyncTypes.pullData,
 lastSyncDate: 0,
 selectedDatatypes: [
   resource,
   reading,
   group
 ]

}
```

```java
interface DataSource {

  public Array<DataType> getDataFromDatasource(int start, int limit, int page);
  public void pushDataToDataSource(Array<DataType> data);

}
```

In order to allow other data sources to write to OW, we will also implement the following methods on the sync model:

- `pushDataFromDatasource(data)`
- `pullDataFromOurWater(start, limit, page)`

These methods will provide a consistent API for others to integrate with us.


## Questions

- How do we handle 2 way sync? 
- How do we handle only some selected data sources? Eg. with ggmn only being able to select specific ids?