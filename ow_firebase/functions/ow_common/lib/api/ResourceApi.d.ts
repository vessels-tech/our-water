import { SomeResult } from "../utils/AppProviderTypes";
import * as admin from "firebase-admin";
import { Resource } from "../model";
import { DocumentReference } from "@google-cloud/firestore";
declare type Firestore = admin.firestore.Firestore;
export declare class ResourceApi {
    private firestore;
    private orgId;
    constructor(firestore: Firestore, orgId: string);
    getResourceForId(resourceId: string): Promise<SomeResult<Resource>>;
    getResourcesForIds(resourceIds: string[]): Promise<SomeResult<Array<Resource>>>;
    resourceRef(resourceId?: string): DocumentReference;
    getResource(resourceRef: DocumentReference): Promise<SomeResult<Resource>>;
}
export {};
