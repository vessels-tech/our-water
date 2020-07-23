# Firebase Cloudstore "Schema"

We use Cloud Firestore as our database. It has great realtime and offline capabilities, which make OurWater easy to use in field scenarios.

## Collections

### `org`

Org is the root collection for our water. The orgId for mywell is `mywell`.

```
collection org: {
  reading: ReadingCollection    
  resource: ResourceCollection  
  shortId: ShortIdCollection
  user: UserCollection
  sync: Collection              # [deprecated] Was used to sync our water with external data
  syncRun: Collection           # [deprecated] Was used to sync our water with external data
}
```

### `ReadingCollection`

```
collection reading: {
  id: string                    # the ID of the reading
  resourceId: string            # the ID of the resource         
  value: number                 # the value of the reading. Units (mm, cm, etc. depend on the resource)
  timeseriesId: string          # the ID of the timeseries - resources can have more than 1 timeseries
  resourceType: string          # the type of the resource (e.g. Well, Raingauge)
  datetime: DateTime            # When the reading was recorded
  createdAt: DateTime           # when this reading resource was created
  updatedAt: DateTime           # when this reading resource was last modified
  coords: LatLng                # the geolocation of the reading
  docName: 'reading'            # the firestore document name 
  externalIds: {}               # a map of external Ids for legacy support
  groups: {}                    # a map of tags or groups that this reading belongs to  
  isLegacy: boolean             # whether or not this reading was imported from legacy MyWell
}
```

### `ResourceCollection`

A Resource is a location that is monitored over time. Resources can have more than 1 timeseries, allowing for multiple readings of different types to be attached to a resource at the same time.

```
collection resource: {
  id: string                      # the ID of the resource       
  timeseriesId: {                 # a map of separate timeseries tracked for this resource      
    default: {
      id: default
    }
  }
  resourceType: string            # the type of the resource being created
  lastReadingDateTime: Datetime   # when the last reading was recorded for this resource
  createdAt: DateTime             # when this reading resource was created
  updatedAt: DateTime             # when this reading resource was last modified
  coords: LatLng                  # the geolocation of the reading
  docName: 'reading'              # the firestore document name 
  externalIds: {}                 # a map of external Ids for legacy support
  groups: {}                      # a map of tags or groups that this resource belongs to  
  orgId: string                   # the orgId of this resource
  owner: {
    createdByUserId: string       # the id of the user who created this resource
    name: string                  # the short name of the user who created this resource           
  }
}
```

### `ShortIdCollection`

A `shortId` is a simple, user-facing alias system we use to make it easy to refer to resourceIds. 

To ensure global uniqueness of resources, we use the default generated ids from firebase, then attach a the shortId to make sharing ids easy.

```
collection shortId {
  id: string[9]
  longId: string
}
```

### `user`

The `user` collection represents a user within the system

```
collection user {
  email: string
  name: string
  nickname: string
  status: 'Approved' | 'Unapproved' | 'Rejected' 
  type: 'User' | 'Admin'
  recentResources: Array<Resource>                 # a list of recently viewed resources
  favouriteResources: Array<Resource>              # a list of resources the user has 'starred'
  newResources: Map<id, NewResource>               # a map of user added resources
}
```
