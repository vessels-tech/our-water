export enum SyncStatus {
  none = 'none', //No changes need be saved or anything
  //Deprecated. Using firebase snapshots prevents the need for this.
  pendingFirebaseWrites = 'pendingFirebaseWrites', //We have pending writes that haven't been saved to firebase yet
  pendingGGMNLogin = 'pendingGGMNLogin', //User has tried to save, but isn't logged into ggmn
  pendingGGMNWrites = 'pendingGGMNWrites', //We have pending writes that have been saved to firebase, but not to GGMN
  ggmnError = 'ggmnError', //There was an error saving readings to ggmn.
}