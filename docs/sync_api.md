

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


## 2 Way Sync Resources

In order to best design and test the sync design, we will start by making the mechanism for syncing new readings between LegacyMyWell and OurWater.

The process will look roughly like:
1. Check the last sync date
2. Pull readings from LegacyMyWell created after the last sync date, saving them to OurWater
2. Look at all the readings created in OurWater after the last sync date, filtering for external readings, and push them to LegacyMyWell


## Challenges:

**Pushing Resources from OW to MyWell is very difficult.** This is because we are abandoning the old Postcode + ResourceId notion for unique ids on every resource. 

This means that if we want to create a resource in OurWater, and then save it to MyWell, we first need to check that MyWell will allow us to create it, and somehow get the id that it should be. This also heavily ties its logic to that of postcodes and villages.

One workaround is to allow the resourceId to be tied to Resource.id on the MyWell side. This is less than ideal as it requires changes to MyWell (which I was hoping to avoid), and could break a bunch of things on the MyWell side.

We are using an int(11) on the MySQL table - perhaps we can can generate a resource id for the corresponding resource type, and append this to a hash of the Resource.id. 

such that:
```
source: [villageId][resourceId][hash(id)]
length: 2          2            6 
```

For example, A new Raingauge created in OurWater with the following properties: 
```js
{
  id: '00znWgaT83RoYXYXxmvk',
  resourceType: 'raingauge',
  ...
}
```

could become the following in LegacyMyWell:
```js
{
  id: '1170<hash(00znWgaT83RoYXYXxmvk)>',
  postcode: '000000',
  type: 'raingauge'
  ...
}
```

This may still require some small changes to MyWell in order to allow ids longer than 4 digits, but it would likely not require too much work




Another option is to create a dummy Postcode to put all of the synced resources into, but this would then be quite limited...




## Questions

- How do we handle 2 way sync? 
- How do we handle only some selected data sources? Eg. with ggmn only being able to select specific ids?


```json
{
    "id": 1111567890,
    "geo": {
      "lat": 24.5931130555556,
      "lng": 74.1983086111111
    },
    "last_value": 20.18,
    "well_depth": 21.95,
    "last_date": "2018-08-06T14:30:00.000Z",
    "owner": "Bagdi Ram s/o Kajod Ji",
    "elevation": 0,
    "type": "well",
    "postcode": 313603,
    "mobile": null,
    "email": null,
    "clientId": null,
    "createdAt": "2018-07-13T01:58:59.000Z",
    "updatedAt": "2018-08-07T03:05:50.000Z",
    "villageId": 11,
    "villageId,postcode": null
  },
```