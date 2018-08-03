import UUID from 'simply-uuid';
import sleep from './utils/Sleep';


import { fs, functions, storage } from './utils/Firebase';

class FirebaseApi {

  static getResourcesForOrg({orgId}) {
    return fs.collection('org').doc(orgId).collection('resource').get()
    .then(sn => {
      const resources = [];
      sn.forEach(doc => {
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

    return resource(resourceData)
      .then(result => {
        // Read result of the Cloud Function.
      })
  };

  /**
   * Upload the file to firebase, and return the path
   */
  static uploadFile({orgId, file}) {
    const newFileRef = storage.ref().child(`${orgId}/fileSync/${UUID.generate()}`);

    return newFileRef.put(file)
    .then(sn =>  {
      return sn.ref.getDownloadURL();
    });
  }

  /**
   * Create a 'Sync' for uploading a file
   * 
   * returns a syncId
   */
  static createFileUploadSync({orgId, fileUrl}) {
    const createSync = functions.httpsCallable(`sync/${orgId}`);
    const data = {
      isOneTime: true,
      datasource: {
        type: "FileDatasource",
        fileUrl,
        dataType: 'Reading',
        fileFormat: 'TSV', //ignored for now
        options: {
          includesHeadings: true,
          usesLegacyMyWellIds: true,
        }
      },
      type: "unknown",
      selectedDatatypes: [
        'reading',
      ]
    };

    return createSync(data)
    .then(result => result.data)
    .catch(err => {
      console.log(err);
      return Promise.reject(err);
    });
  }

  /**
   * Run a sync of a given id with a few extra options
   * 
   * returns the id of the 'syncRun'.
   */
  static runFileUploadSync({orgId, syncId, validateOnly}) {
    let method = 'pullFrom';
    if (validateOnly) {
      method = 'validate';
    }
    const runSync = functions.httpsCallable(`sync/${orgId}/run/${syncId}?method=${method}`);

    return runSync()
    .then(result => result.data)
    .catch(err => {
      console.log(err);
      return Promise.reject(err);
    });
  }


  static getSyncRun({orgId, syncRunId}) {
    return fs.collection('org').doc(orgId).collection('syncRun').doc(syncRunId).get()
    .then(sn => {
      return sn.data();
    });
  }

  /**
   * Loop through retries, waiting until the sync is finished
   * @param {*} param0 
   */
  static pollForSyncRunStatus({orgId, syncRunId, retries}) {
    return new Promise((resolve, reject) => {
      retries.some((retryTime, idx) => {
        sleep(retryTime)
        .then(() => FirebaseApi.getSyncRun({ orgId, syncRunId }))
        .then(syncRun => {
          console.log("syncRun:", syncRun);

          if (syncRun.status === 'finished') {
            return resolve(syncRun);
          }

          if (syncRun.status === 'failed') {
            return reject(syncRun);
          }

          //Final run, no result
          console.log('idx', idx);
          if (idx === retries.length - 1) {
            console.log('sync timed out');
            return reject(syncRun);
          }
        });
      });

    });
  }

}

export default FirebaseApi;