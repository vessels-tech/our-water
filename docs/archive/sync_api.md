

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

### Pushing Resources to LegacyMyWell

When creating a resource in OurWater, we need to have some optional extra fields which will allow it to be saved into LegacyMyWell.

Such as:
`externalIds.legacyMyWellPincode`

If a resource has `externalIds.legacyMyWellPincode`, but no `externalIds.legacyMyWellId`, then it can be persisted into LegacyMyWell easily.

**TODO: Later on, we can implement this more complicated implicit logic:**

When a (1) group is created, (2) a group is updated, (3) a resource is created inside a group, if that group is of type Pincode, we can populate the `externalIds.legacyMyWellPincode` automatically.





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