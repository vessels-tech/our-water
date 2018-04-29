



## Firebase Cloudstore

We are using Firebase Cloudstore NoSQL database for our database needs.

Proposed data structure:


org
  |- name
  |-
  |---- location (collection)
         |- type
         |- shapefile?
  |
  |
  |
  |
  |
  |---- resource (collection)
          |- type
          |- latlng



const locationTypes: {
  village
  pincode

}

const resourceTypes: {
  well
  checkdam
  raingauge
  custom
}


const resourceMetadata: {
  well
}




## Cloud Firestore evaluation:


good:
- easy to use
- visual console
- database triggers, for really serverless architecture
- no need for a
- cheap
- realtime


bad:
- no geo queries
- no multiple filters/composite queries



Can we get around geo queries?
- add a location id to each resource and reading?
- only search by boxes?
  - we can do geo queries with just squares.


```js
resource: {
  id: string
  readings: collection,
  lastReading:
  location: {
    latitude:
    longitude:
  },
  type: {
    well: true,
    checkdam: false,
    raingauge: false
  }
}

reading: {
  id:
  date:
  value:
  type: {
    well: true,
    checkdam: false,
    raingauge: false
  }
  location: {
    latitude:
    longitude:
  }
}

```


This seems like a better way to structure our data.
```js
{
  org: {
    groups: {
      village1: {
        type: village

      },
      india: {
        type: country
      },
      pincode123456: {
        type: pincode
      }
    },
    resource: {
      one: {
        lastReading:
        latLng:
        name:
        owner:
        average:
        type:
        // This is an index?
        groups: {
          village1: true,
          india: true,
        }
      }

    },
    reading: {
      resourceId: {
        value: {
          r1: {
            value: 12.4,
            datetime: 2018-01-01...
            latLng:
            groups: {
              village
            }
          }
        }
      }
    }
  }
}


```

challenges with this approach:

- we need to make sure that update fields properly




TODO: 
- finish data restructure and test
- add listeners and updates:
  - groups on resources and readings
  - lastValue on resource

- endpoints for group based queries
