import { Resource } from "../model/Resource";
import { SomeResult } from "../utils/AppProviderTypes";
import { DictType } from "../utils/DictType";
import { User } from "../model/User";
import UserStatus from "../enums/UserStatus";
import UserType from "../enums/UserType";
import * as admin from "firebase-admin";
import { DocumentReference } from "@google-cloud/firestore";
import { Reading } from "../model";
declare type Firestore = admin.firestore.Firestore;
export declare class UserApi {
    firestore: Firestore;
    orgId: string;
    constructor(firestore: Firestore, orgId: string);
    addFavouriteResource(userId: string, resource: Resource): Promise<SomeResult<void>>;
    /**
     * Add a list of favourite resources to the user's favourites
     */
    addFavouriteResources(userId: string, resources: Resource[]): Promise<SomeResult<void>>;
    /**
     * Add new resources to the User's object.
     */
    markAsNewResources(userId: string, resourceIds: string[]): Promise<SomeResult<void>>;
    removeNewResource(userId: string, resourceId: string): Promise<SomeResult<void>>;
    getNewResources(userId: string): Promise<SomeResult<DictType<string>>>;
    private updateNewResources;
    removeFavouriteResource(userId: string, resourceId: string): Promise<SomeResult<void>>;
    private updateFavouriteResources;
    getFavouriteResources(userId: string): Promise<SomeResult<DictType<Resource>>>;
    getRecentResources(userId: string): Promise<SomeResult<Resource[]>>;
    /**
     * Change the user's status
     */
    changeUserStatus(userId: string, status: UserStatus.Approved | UserStatus.Rejected): Promise<SomeResult<void>>;
    changeUserType(userId: string, type: UserType): Promise<SomeResult<void>>;
    /**
     * mergeUsers
     *
     * Merge two user accounts together. Includes merging subcollections
     */
    mergeUsers(oldUserId: string, newUserId: string): Promise<SomeResult<any>>;
    /**
     * mergeUserPendingReadings
     *
     * Merge together a user's pending readings
     *
     * @param oldUserId
     * @param newUserId
     */
    mergeUserPendingReadings(oldUserId: string, newUserId: string): Promise<SomeResult<any>>;
    /**
     * mergeUserPendingResources
     *
     * Merge together a user's pending resources. Also updates the resource.owner.createdByUserId field to the
     * new user.
     *
     * @param oldUserId
     * @param newUserId
     */
    mergeUserPendingResources(oldUserId: string, newUserId: string): Promise<SomeResult<any>>;
    userRef(orgId: string, userId: string): DocumentReference;
    getUser(userRef: DocumentReference): Promise<SomeResult<User>>;
    getPendingReadings(userRef: DocumentReference): Promise<SomeResult<Reading[]>>;
    getPendingResources(userRef: DocumentReference): Promise<SomeResult<Resource[]>>;
}
export {};
