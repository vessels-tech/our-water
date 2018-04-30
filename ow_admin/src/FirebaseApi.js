
import { fs, functions } from './utils/Firebase';

class FirebaseApi {

  static getResourcesForOrg({orgId}) {
    console.log('id is', orgId);
    return fs.collection('org').doc(orgId).collection('resource').get()
    .then(sn => {
      console.log(sn);
      const resources = [];
      sn.forEach((doc) => {
        //Get each document, put in the id
        const data = doc.data();
        data.id = doc.id;
        resources.push(data);
      });
      
      return resources;
    });
  }

  static createNewResource({orgId, resourceData}) {
    const resource = functions.httpsCallable(`resource/${orgId}`);
  
    //TODO: cors, figure out how to set the path here.
    return resource(resourceData)
      .then(result => {
        // Read result of the Cloud Function.
      })
  };
}

export default FirebaseApi;