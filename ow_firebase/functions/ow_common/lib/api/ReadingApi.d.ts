import * as admin from "firebase-admin";
import { DocumentSnapshot, CollectionReference } from "@google-cloud/firestore";
import { Reading } from "../model";
import { SomeResult } from "../utils";
declare type Firestore = admin.firestore.Firestore;
export declare type ReadingPageParams = {
    lastVisible?: DocumentSnapshot;
    limit: number;
};
export declare type ReadingResult = {
    readings: Reading[];
    params: ReadingPageParams;
};
export declare class ReadingApi {
    private firestore;
    private orgId;
    constructor(firestore: Firestore, orgId: string);
    /**
     * getReadingsForResources
     *
     * Given a list of resourceIds, get all of the readings for the resources up to
     * a limit of n (params.limit). Implementing this limit will be tricky as Firestore
     * doesn't currently support OR queries, meaning that we will have to merge and keep
     * track of of cursors for each id.
     *
     * For now gets the latest n readings for the given resources, but if needed we
     * may add the ability to filter by date. Also ignores the lastVisible, as we
     * can't really implement paginiation across multiple queries very easily atm.
     *
     * This also wont respect date ordering from one resource to another, as the individual
     * date queries are merged together.
     *
     * @param resourceIds
     * @param params
     */
    getReadingsForResources(resourceIds: string[], params: ReadingPageParams): Promise<SomeResult<ReadingResult>>;
    /**
     * getReadingsForResourceId
     *
     * Given a resourceId, get all of the readings for the resources up to
     * a limit of n (params.limit)
     *
     * For now gets the latest n readings for the given resources, but if needed we
     * may add the ability to filter by date
     *
     * @param resourceId
     * @param params
     */
    getReadingsForResourceId(resourceId: string, params: ReadingPageParams): Promise<SomeResult<ReadingResult>>;
    /**
     * bulkSaveReadings
     *
     * Save readings in bulk
     */
    bulkUploadReadings(readings: Reading[], batchSize: number): Promise<SomeResult<any>>;
    /**
     * getReadingImage
     *
     * Get the reading image for a given reading id
     *
     * @param readingId - the hashed readingId
     * @returns Promise<SomeResult<string>> - a base64 encoded string of the image in png format
     */
    getReadingImage(readingId: string): Promise<SomeResult<string>>;
    readingCol(): CollectionReference;
    /**
     * The Id for a reading is generated as a hash of the
     * reading's dateTime + ResourceId + timeseriesId.
     *
     * For now, we can just encode it as a base64 string
     */
    static hashReadingId(resourceId: string, timeseriesId: string, dateTime: Date): string;
    static commitBatch(batch: FirebaseFirestore.WriteBatch): Promise<SomeResult<Array<FirebaseFirestore.WriteResult>>>;
}
export {};
