# Short Id Specification

In order to make OurWater approachable to less literate users, we need to make a way to shorten ids to a number of alphanumeric characters.

Within the firebase environment, a Location currently has an id as follows:

`09ArIxv9MJwnmtWfjr5z`

Each environment of OurWater will have different requirements, for example:

- MyWell needs to work across a number of countries, and needs to contain numbers only, since the users are not likely to know English characters
- GGMN has their own ids that they define, and hence we won't need this feature


Instead of ids being seen as permanent, we will treat them more like a url shortening service. If a short id goes out of use for a while, it can be recycled later on. This also means that a given resource will contain a `shortId` parameter, the `shortId` will always be used separately. The shortId should only really be a way for end users to look up a given location, and not be used internally for handling data.

ShortIds are scoped to a given organisation. In order to identify a unique resource within the entire OurWater ecosystem, a user must know both the OrganisationId and shortId. This will likely not be a problem, as with new deployments of OurWater, the organisation Id can most likely be assumed based on the location/managing organisation.


## The Scheme


### Rule 1:
A Short Id shall be 9 digits long, and can be written with spaces, dashes, or no spaces. For example:
```
991-092-239
991 092 239
991092239
```
Are all examples of valid shortIds.

### Rule 2:
Furthermore, a Short Id with three leading 0s can be written as a six digit number. For example:
```
000-123-456
123-456
123456
```
are all valid ShortIds. 

This enables us to keep the shortId easy to write and understand for users, but also enables us to have the flexibilty to expand this to allow for more uniqueness if required.

### Rule 3:
Short Ids should be created sequentially, starting from `100-000`



## Generating a Short Id

We cannot generate short Ids from random numbers, or a hash of the long id; the chances of a colission are far too high. This means that we need to generate shortIds sequentually. The challenge here is that if 2 shortIds are generated simultaneously, we risk generating 2 ids that are the same. Perhaps we can use transactions or locks to get around this.

Firestore structure:
```
...
000123456=>{id: <long_id_1>, createdAt, lastUsed}
000123457=>{id: <long_id_2>, createdAt, lastUsed}
000123458=>{id: <long_id_3>, createdAt, lastUsed}
latest=>{ id: 000123458, lock: false}
...
```

### Step 1:

Client gets the latest id from firestore GET `/org/<orgId>/shortId/latest`

`latest=>{ id: 000123458, lock: false}`

### Step 2:

Client obtains a lock by setting the latest.lock to true

Firestore structure:
```
...
latest=>{ id: 000123458, lock: true}
...
```

### Step 3:

Client increments the id by 1, saves the shortId, and updates the latest to release the lock

```
000123458=>{id: <long_id_3>, createdAt, lastUsed}
000123459=>{id: <long_id_4>, createdAt, lastUsed}
latest=>{ id: 000123459, lock: false}
```



## Potential Uses

- in QR codes
- in URLs


## Drawbacks


## Implementation