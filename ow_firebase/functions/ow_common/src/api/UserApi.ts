import { Resource, DefaultMyWellResource } from "../model/Resource";
import { SomeResult, ResultType, makeSuccess, makeError, summarizeResults } from "../utils/AppProviderTypes";
import { DictType } from "../utils/DictType";
import { User, DefaultUser } from "../model/User";
import UserStatus from "../enums/UserStatus";
import UserType from "../enums/UserType";
import * as admin  from "firebase-admin";
import { DocumentReference } from "@google-cloud/firestore";
import ArrayUtils from "../utils/ArrayUtils";
import { Reading, DefaultReading } from "../model";
import { safeGetNestedDefault, getOrElse } from "../utils";

type Firestore = admin.firestore.Firestore;

export class UserApi {
  firestore: Firestore;
  orgId: string;

  constructor(firestore: Firestore, orgId: string) {
    this.firestore = firestore;
    this.orgId = orgId;
  }

  public async addFavouriteResource(userId: string, resource: Resource): Promise<SomeResult<void>> {
    const favouritesResult = await this.getFavouriteResources(userId);
    if (favouritesResult.type === ResultType.ERROR) {
      return favouritesResult;
    }
    const favourites = favouritesResult.result;
    favourites[resource.id] = resource;

    return this.updateFavouriteResources(userId, favourites);
  }

  /**
   * Add a list of favourite resources to the user's favourites
   */
  public async addFavouriteResources(userId: string, resources: Resource[]): Promise<SomeResult<void>> {
    const favouritesResult = await this.getFavouriteResources(userId);
    if (favouritesResult.type === ResultType.ERROR) {
      return favouritesResult;
    }
    const favourites = favouritesResult.result;
    resources.forEach(r => {
      favourites[r.id] = r;
    });

    return this.updateFavouriteResources(userId, favourites);
  }

  /**
   * Add new resources to the User's object.
   */
  public async markAsNewResources(userId: string, resourceIds: string[]): Promise<SomeResult<void>> {
    const newResourcesResult = await this.getNewResources(userId);
    if (newResourcesResult.type === ResultType.ERROR) {
      return newResourcesResult;
    }
    const newResources = newResourcesResult.result;
    resourceIds.forEach(id => newResources[id] = id);

    return this.updateNewResources(userId, newResources);
  }

  public async removeNewResource(userId: string, resourceId: string): Promise<SomeResult<void>> {
    const newResourcesResult = await this.getNewResources(userId);
    if (newResourcesResult.type === ResultType.ERROR) {
      return newResourcesResult;
    }
    const newResources = newResourcesResult.result;
    delete newResources[resourceId];

    return this.updateNewResources(userId, newResources);
  }

  public async getNewResources(userId: string): Promise<SomeResult<DictType<string>>> {
    const userResult = await this.getUser(this.userRef(this.orgId, userId));
    if (userResult.type === ResultType.ERROR) {
      return userResult;
    }

    const user = userResult.result;
    return makeSuccess(user.newResources);
  }

  private async updateNewResources(userId: string, newResources: DictType<string>): Promise<SomeResult<void>> {
    return this.userRef(this.orgId, userId).update({ newResources })
      .then(() => makeSuccess(undefined))
      .catch((err: Error) => makeError(err.message))
  }

  public async removeFavouriteResource(userId: string, resourceId: string): Promise<SomeResult<void>> {
    const favouritesResult = await this.getFavouriteResources(userId);
    if (favouritesResult.type === ResultType.ERROR) {
      return favouritesResult;
    }
    const favourites = favouritesResult.result;
    delete favourites[resourceId];

    return this.updateFavouriteResources(userId, favourites);
  }

  private async updateFavouriteResources(userId: string, favouriteResources: DictType<Resource>): Promise<SomeResult<any>> {
    return this.userRef(this.orgId, userId).set({ favouriteResources }, { merge: true })
      .then(() => makeSuccess(undefined))
      .catch((err: Error) => makeError(err.message))
  }

  public async getFavouriteResources(userId: string): Promise<SomeResult<DictType<Resource>>> {
    const userResult = await this.getUser(this.userRef(this.orgId, userId));
    if (userResult.type === ResultType.ERROR) {
      return userResult;
    }

    const user = userResult.result;
    return makeSuccess(user.favouriteResources);
  }

  public async getRecentResources(userId: string): Promise<SomeResult<Resource[]>> {
    const userResult = await this.getUser(this.userRef(this.orgId, userId));
    if (userResult.type === ResultType.ERROR) {
      return userResult;
    }

    const user = userResult.result;
    return makeSuccess(user.recentResources);
  }

  /**
   * Change the user's status
   */
  public async changeUserStatus(userId: string, status: UserStatus.Approved | UserStatus.Rejected): Promise<SomeResult<void>> {
    return this.userRef(this.orgId, userId).set({ status }, { merge: true })
      .then(() => makeSuccess(undefined))
      .catch((err: Error) => makeError(err.message))
  }

  public async changeUserType(userId: string, type: UserType): Promise<SomeResult<void>> {
    return this.userRef(this.orgId, userId).set({type}, { merge: true})
    .then(() => makeSuccess(undefined))
  }


  /**
   * mergeUsers
   * 
   * Merge two user accounts together. Includes merging subcollections
   */
  public async mergeUsers(oldUserId: string, newUserId: string): Promise<SomeResult<any>> {

    const oldUserResult = await this.getUser(this.userRef(this.orgId, oldUserId));
    if (oldUserResult.type === ResultType.ERROR) {
      return oldUserResult;
    }
    const newUserResult = await this.getUser(this.userRef(this.orgId, newUserId));
    if (newUserResult.type === ResultType.ERROR) {
      return oldUserResult;
    }
    const oldUser = oldUserResult.result;
    const newUser = newUserResult.result;

    const mergePendingReadingsResult = await this.mergeUserPendingReadings(oldUserId, newUserId);
    if (mergePendingReadingsResult.type === ResultType.ERROR) {
      return mergePendingReadingsResult;
    }

    const mergePendingResourcesResult = await this.mergeUserPendingResources(oldUserId, newUserId);
    if (mergePendingResourcesResult.type === ResultType.ERROR) {
      return mergePendingResourcesResult;
    }

    const userToSave: User = {
      id: newUser.id,
      favouriteResources: {...oldUser.favouriteResources, ...newUser.favouriteResources},
      newResources: {...oldUser.newResources, ...newUser.newResources},
      pendingSavedReadings: [], //this is a subcollection
      pendingSavedResources: [], //this is a subcollection
      recentResources: ArrayUtils.mergeArrays<Resource>(oldUser.recentResources, newUser.recentResources, (r) => r.id),
      recentSearches: ArrayUtils.mergeArrays<string>(oldUser.recentSearches, newUser.recentSearches, (s: string) => s),
      status: newUser.status,
      translation: newUser.translation,
      type: newUser.type
    };

    return this.userRef(this.orgId, newUserId).set(userToSave, { merge: true })
    .then(() => makeSuccess(undefined))
    .catch((err: Error) => makeError(err.message));
  }

  /**
   * mergeUserPendingReadings
   * 
   * Merge together a user's pending readings
   * 
   * @param oldUserId 
   * @param newUserId 
   */
  public async mergeUserPendingReadings(oldUserId: string, newUserId: string): Promise<SomeResult<any>> {
    const oldReadingsResult = await this.getPendingReadings(this.userRef(this.orgId, oldUserId));
    if (oldReadingsResult.type === ResultType.ERROR) {
      return oldReadingsResult;
    }

    const oldReadings = oldReadingsResult.result;
    //we don't care about the doc id here...
    const saveReadingsResult = summarizeResults(await Promise.all(oldReadings.map(r => {
      return this.userRef(this.orgId, newUserId).collection('pendingReadings').add(r)
      .then(() => makeSuccess<void>(undefined))
      .catch((err: Error) => makeError<void>(err.message));
    })));

    return saveReadingsResult;
  }

  /**
   * mergeUserPendingResources
   *
   * Merge together a user's pending resources. Also updates the resource.owner.createdByUserId field to the
   * new user.
   *
   * @param oldUserId
   * @param newUserId
   */
  public async mergeUserPendingResources(oldUserId: string, newUserId: string): Promise<SomeResult<any>> {
    const oldResourcesResult = await this.getPendingResources(this.userRef(this.orgId, oldUserId));
    if (oldResourcesResult.type === ResultType.ERROR) {
      return oldResourcesResult;
    }

    const oldResources = oldResourcesResult.result;
    const saveResourcesResult = summarizeResults(await Promise.all(oldResources.map(r => {

      //Update the createdByUserId
      //TODO: TD: for some reason we need to clone here for tests to pass... not sure why.
      const owner: DictType<string> = JSON.parse(JSON.stringify(safeGetNestedDefault(r, ['owner'], {})));
      owner.createdByUserId = newUserId;

      return this.userRef(this.orgId, newUserId).collection('pendingResources').doc(r.id).set({
        ...r,
        owner,
      })
      .then(() => makeSuccess<void>(undefined))
      .catch((err: Error) => makeError<void>(err.message));
    })));

    return saveResourcesResult;
  }
           
  //
  // Helpers
  // ------------------------------------

  public userRef(orgId: string, userId: string): DocumentReference {
    return this.firestore.collection('org').doc(orgId).collection('user').doc(userId);
  }

  public async getUser(userRef: DocumentReference): Promise<SomeResult<User>> {
    return userRef.get()
    .then(sn => {
      let data = getOrElse(sn.data(), {});

      //Set the default user data here.
      return makeSuccess({
        ...DefaultUser,
        ...data
      });
    })
    .catch((err: Error) => makeError<User>(err.message))
  }

  public async getPendingReadings(userRef: DocumentReference): Promise<SomeResult<Reading[]>> {
     return userRef.collection('pendingReadings').get()
      .then(qs => {
        const readings: Reading[] = [];
        qs.forEach(sn => {
          if (!sn.data()) {
            return;
          }
          readings.push({
            ...DefaultReading,
            ...sn.data(),
          });
        });
        return readings;

      })
      .then((readings: Reading[]) => makeSuccess(readings))
      .catch((err: Error) => makeError<Reading[]>(err.message))
  }

  public async getPendingResources(userRef: DocumentReference): Promise<SomeResult<Resource[]>> {
     return userRef.collection('pendingResources').get()
      .then(qs => {
        const resources: Resource[] = [];
        qs.forEach(sn => {
          if (!sn.data()) {
            return;
          }
          resources.push({
            ...DefaultMyWellResource,
            ...sn.data(),
            id: sn.id,
          });
        });
        return resources;
      })
       .then((readings: Resource[]) => makeSuccess(readings))
       .catch((err: Error) => makeError<Resource[]>(err.message))
  }

}