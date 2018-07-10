



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
      r1: {
        resourceId: one
        value: 12.4,
        datetime: 2018-01-01...
        latLng:
        groups: {
          village1: true
        }
      }
    }
  }
}

//Maybe instead of nesting:
org/orgId/reading/resourceId/value/readingId, we should have a resourceId field on reading...



```

challenges with this approach:

- we need to make sure that update fields properly




TODO: 

- endpoints for group based queries
  
  getReadingsForGroup(group) [done]
  getReadingsForResource() [done]
  getResourcesForGroup() []

  queries for graph data?
  - getAverageForGroup(group, resourceType, startTime, endTime) []
  - others?


- getResourcesNearLocation(lat, lng, distance) [done]

- write down proper type definitions and figure out typescript
- start working on fast static group/resource detail page?
- investigate legacy id compatability


- secure the endpoints
- when registering a new resource, allow user to select from a number of groups
- when registering a new resource, add extra fields for each resource type. Eg. Well.maxDepth
- ow_admin: list resources by groups


Authentication example:
https://github.com/firebase/functions-samples/tree/master/authorized-https-endpoint

Simple example for multiple sites on single firebase hosting
https://medium.com/@michael.warneke/hosting-multiple-angular-apps-on-firebase-fb15e2a9dda9




## Android react-native setup

```
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

remote debugger
https://stackoverflow.com/questions/40898934/unable-to-connect-with-remote-debugger



`I solved it doing adb reverse tcp:8081 tcp:8081 and then reload on my phone.`

point to our react-native-maps
"react-native-maps": "https://github.com/lewisdaly/react-native-maps.git#7142cc618bd8fcc5df24221cb2c1fb64d5880750",


## handy
```bash
#allow tunnel
adb reverse tcp:8081 tcp:8081

#present devtools menu
adb shell input keyevent 82
```

## launch avd from command line

```bash
cd ~/Library/Android/sdk/tools/bin/
./avdmanager list avd

#look for name: Nexus_5X_API_P

cd ../../emulator
./emulator -avd Nexus_5X_API_P

```

https://medium.com/@drorbiran/the-full-react-native-layout-cheat-sheet-a4147802405c


## TODO:

### ow_client

#### Functionality

- save readings for a resource
- display groups on the map
- group together resources when zoomed out
- add and remove favourites not working
- map markers not on map
- register a new resource


#### Design:

- figure out detail screen design
- figure out how to nicely display random IDs


#### Other:

- hide search 'x' when not editing search bar
- translations
- fix glitchy maps, drag end event
- improve search to use more than just ids


### ow_firebase

- sync readings with MyWell
- sync resources with MyWell





### GGMN

- Add login/settings screen 
- add new reading sync indicator
- firebase config 


## Material design guide:

https://material.io/tools/color/#!/?view.left=0&view.right=0&primary.color=BBDEFB&primary.text.color=212121


## Samples:


### Good button with icon
```jsx
 <Button
  buttonStyle={{
    flex: 1,
    backgroundColor: bgLight,
    height: 50,
    width: '100%'
  }}
  large
  icon={{
    name: 'cached',
    color: textDark,
  }}
  color={textDark}
  underlayColor={bgLightHighlight}
  titleStyle={{ fontWeight: 'bold', fontSize: 23 }}
  title='Language'
  onPress={() => console.log("language pressed")}
/>
```