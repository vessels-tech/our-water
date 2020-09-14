# OurWater Documentation

## Specifications:

- [Firestore 'Schema'](./firestore_structure.md)
- [Short Id](./short_id_specification.md)
- [QR Codes](./qr_codes.md)

## Data Flows:

### 1. Saving a reading
### 2. Creating a new resource

1. From homepage click 'New'
2. Fill out form and click 'Submit'
3. `MyWellApi.saveResource()`
4. `firestore.collection('org').doc(orgId).collection('user').doc(userId).collection('pendingResources').doc(resource.id).set(resource);`
5. Navigate to 'Save Pending Resources'
6. Select 'Sync'
7. `MyWellApi.runInternalSync()`
8. `POST /resource/{orgId}/{userId}/sync`
9. User's new resources are now available publicly


### 3. Creating a new user and signing in
### 4. Approving Users


## Screenshots

<div>
 <img src="./images/screenshots/01.jpg" width="250">
 <img src="./images/screenshots/02.jpg" width="250">
 <img src="./images/screenshots/03.jpg" width="250">
</div>
<div>
 <img src="./images/screenshots/04.jpg" width="250">
 <img src="./images/screenshots/05.jpg" width="250">
 <img src="./images/screenshots/06.jpg" width="250">
</div>
<div>
 <img src="./images/screenshots/07.jpg" width="250">
 <img src="./images/screenshots/08.jpg" width="250">
 <img src="./images/screenshots/09.jpg" width="250">
</div>
<div>
 <img src="./images/screenshots/10.jpg" width="250">
 <img src="./images/screenshots/11.jpg" width="250">
 <img src="./images/screenshots/12.jpg" width="250">
</div>
