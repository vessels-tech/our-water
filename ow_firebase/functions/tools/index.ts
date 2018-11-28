// const admin = require('firebase-admin');
const request = require('request-promise-native');
// /* Not in git. Download from FB console*/
// const serviceAccount = require('../../.serviceAccountKey.json');

// if (admin.apps.length === 0) {
//   admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount),
//     // databaseURL: databaseUrl,
//     // storageBucket,
//   });

//   const firestore = admin.firestore();
//   const settings = { timestampsInSnapshots: true };
//   firestore.settings(settings);
// }

// const auth = admin.auth();


export async function getToken(admin: any): Promise<string> {
  return admin.auth().createCustomToken('12345')
  .then(function (customToken) {

    const options = {
      json: true,
      url: `https://www.googleapis.com/identitytoolkit/v3/relyingparty/verifyCustomToken?key=${process.env.WEB_API_KEY}`,
      method: 'POST',
      body: {
        token: customToken,
        returnSecureToken: true
      },
    };
    return request(options)
  })
  .then(response => {
    return response.idToken;
  })
  .catch(function (error) {
    console.log("Error creating custom token:", error);
  });
}

export async function getAuthHeader(admin: any): Promise<{Authorization: string}> {
  const token = await getToken(admin);

  return {
    Authorization: `Bearer ${token}`
  };
}