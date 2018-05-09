import * as firebase from 'firebase';
import 'firebase/functions';
import 'firebase/firestore';

const config = {
  apiKey: process.env.REACT_APP_FB_API_KEY,
  authDomain: process.env.REACT_APP_FB_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_FB_DATABASE_URL,
  projectId: process.env.REACT_APP_FB_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FB_STORAGE_BUCKET,
  // messagingSenderId: YOUR_MESSAGING_SENDER_ID,
};

if (!firebase.apps.length) {
  firebase.initializeApp(config);
}

// const app = firebase.initializeApp(config);

const auth = firebase.auth();
const functions = firebase.functions();
//Firestore database
const fs = firebase.firestore();
const storage = firebase.storage();

export {
  auth,
  fs,
  functions,
  storage,
};
