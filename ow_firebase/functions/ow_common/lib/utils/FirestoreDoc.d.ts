/**
 * FirestoreDoc
 *
 * This is a second pass at a kind of ORM for Firestore.
 * It has many issues, and so shouldn't be used as of yet,
 * but can hopefully inform future work in this area.
 *
 *
 */
import * as admin from "firebase-admin";
declare type Firestore = admin.firestore.Firestore;
import { DocumentData, SetOptions } from "@google-cloud/firestore";
import { Maybe } from "./Maybe";
import { SomeResult } from "./AppProviderTypes";
export declare type FirestoreDocTypes = {
    orgId: string;
    id: Maybe<string>;
    createdAt: Maybe<Date>;
    updatedAt: Maybe<Date>;
};
export declare class FirestoreDoc<T> {
    firestore: Firestore;
    props: T & FirestoreDocTypes;
    docName: Maybe<string>;
    constructor(firestore: Firestore, orgId: string, props: T);
    create(): Promise<SomeResult<FirestoreDoc<T>>>;
    save(options?: SetOptions): Promise<SomeResult<FirestoreDoc<T>>>;
    /**
     * Create docs as part of a Batch
     * Put in an id, or allow firebase to create one for you.
     */
    batchCreate(batch: FirebaseFirestore.WriteBatch, firestore: FirebaseFirestore.Firestore, id?: string): void;
    /**
     * Delete docs as a part of a Batch
     *
     * If no ID is provided, will use the id of the FirestoreDoc.
     */
    batchDelete(batch: FirebaseFirestore.WriteBatch, firestore: FirebaseFirestore.Firestore, id?: string): void;
    serialize(): DocumentData;
    underlyingProps(): T;
    static _get<U>(firestore: Firestore, docName: string, orgId: string, id: string, transform: (data: any) => U): Promise<SomeResult<FirestoreDoc<U>>>;
}
export {};
