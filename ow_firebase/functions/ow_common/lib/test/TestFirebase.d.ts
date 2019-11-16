import * as admin from "firebase-admin";
declare type Firestore = admin.firestore.Firestore;
declare let firestore: Firestore;
declare const auth: admin.auth.Auth;
export { admin, auth, firestore };
