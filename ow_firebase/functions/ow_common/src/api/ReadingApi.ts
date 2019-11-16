// import { SomeResult, makeError, makeSuccess, ResultType, ErrorResult } from "../utils/AppProviderTypes";
import * as admin from "firebase-admin";
import { DocumentSnapshot, CollectionReference, QueryDocumentSnapshot, QuerySnapshot } from "@google-cloud/firestore";
import { Reading, DefaultReading } from "../model";
import { SomeResult, safeLower, makeSuccess, makeError, ErrorResult, ResultType, chunkArray, safeGetNested } from "../utils";
import btoa from 'btoa';

type Firestore = admin.firestore.Firestore;


export type ReadingPageParams = {
  lastVisible?: DocumentSnapshot,
  limit: number,
}

export type ReadingResult = {
  readings: Reading[],
  params: ReadingPageParams
}

export class ReadingApi {
  private firestore: Firestore;
  private orgId: string;


  constructor(firestore: Firestore, orgId: string) {
    this.firestore = firestore;
    this.orgId = orgId;
  }


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
  async getReadingsForResources(resourceIds: string[], params: ReadingPageParams): Promise<SomeResult<ReadingResult>> {

    //Hard rules because of firebase restrictions
    delete params.lastVisible;
    params.limit = 100;

    const readingsResults = await Promise.all(resourceIds.map(id => this.getReadingsForResourceId(id, params)));
    let readings: Reading[] = [];
    const errors: ErrorResult[] = [];
    readingsResults.forEach(result => {
      if (result.type === ResultType.ERROR) {
        errors.push(result);
        return;
      }

      readings = readings.concat(result.result.readings);
    });

    if (errors.length > 0) {
      const message = errors.reduce((acc, curr) => acc + " " + curr.message, "Multiple Errors:");
      return makeError(message);
    }

    return makeSuccess({
      params,
      readings,
    });
  }


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
  async getReadingsForResourceId(resourceId: string, params: ReadingPageParams): Promise<SomeResult<ReadingResult>> {

    let query: any = this.readingCol()
    .where(`resourceId`, '==', resourceId)

    //I think these results will be ordered, since the readingIds are ordered inherently, but here:
    .orderBy('datetime', 'desc');

    if (params.lastVisible) {
      query = query.startAfter(params.lastVisible);
    }
    query = query.limit(safeLower(params.limit, 100));

    //Run the query
    let lastVisible: QueryDocumentSnapshot;
    return await query.get()
    .then((sn: QuerySnapshot) => {
      const readingResults: Reading[] = [];
      lastVisible = sn.docs[sn.docs.length - 1];

      sn.forEach(doc => {
        const data = doc.data();
        if (!data) {
          return;
        }
        
        const reading: Reading = {
          ...DefaultReading,
          ...data,
          //TODO: deserialize here.
        };
        readingResults.push(reading);
      });

      return readingResults;
    })
    .then((readings: Reading[]) => {
      const readingResult: ReadingResult = {
        params: {
          ...params,
          lastVisible,
        },
        readings,
      };

      return makeSuccess(readingResult);
    })
    .catch((err: Error) => makeError(err.message));
  }


  /**
   * bulkSaveReadings
   * 
   * Save readings in bulk
   */
  async bulkUploadReadings(readings: Reading[], batchSize: number): Promise<SomeResult<any>> {
    const readingBatches = chunkArray(readings, batchSize);
    let writeResults: any[] = [];

    const batchSaveResult = await readingBatches.reduce(async (acc: Promise<SomeResult<any>>, curr: Reading[], idx) => {
      const lastResult = await acc;
      if (lastResult.type === ResultType.ERROR) {
        return Promise.resolve(lastResult);
      }

      const batch = this.firestore.batch();
      curr.forEach(reading => {
        const id = ReadingApi.hashReadingId(reading.resourceId, reading.timeseriesId, new Date(reading.datetime));
        const ref = this.readingCol().doc(id);
        batch.set(ref, {
          ...DefaultReading,
          ...reading
        });
      });

      return await ReadingApi.commitBatch(batch)
      .then(result => {
        if (result.type === ResultType.SUCCESS) {
          writeResults = writeResults.concat(result.result);
        }
        return result;
      })
    }, Promise.resolve(makeSuccess<any>(undefined)));

    if (batchSaveResult.type === ResultType.ERROR) {
      return batchSaveResult;
    }

    return makeSuccess(writeResults);
  }

  /**
   * getReadingImage
   * 
   * Get the reading image for a given reading id
   * 
   * @param readingId - the hashed readingId
   * @returns Promise<SomeResult<string>> - a base64 encoded string of the image in png format
   */
  public getReadingImage(readingId: string): Promise<SomeResult<string>> {
    return this.readingCol().doc(readingId).get()
      .then(doc => {
        if (!doc.data()) {
          return makeError(`No reading found for readingId: ${readingId}`);
        }
        const base64Image = safeGetNested(doc.data(), ['image', 'base64Image']);
        if (!base64Image) {
          return makeError(`No image found for readingId: ${readingId}`);
        }

        return makeSuccess(base64Image);
      })
      .catch(err => makeError(err.message));
  }

  public readingCol(): CollectionReference {
    return this.firestore.collection('org').doc(this.orgId).collection('reading');
  }


  /**
   * The Id for a reading is generated as a hash of the
   * reading's dateTime + ResourceId + timeseriesId.
   * 
   * For now, we can just encode it as a base64 string
   */
  public static hashReadingId(resourceId: string, timeseriesId: string, dateTime: Date): string {
    const input = `${resourceId}_${timeseriesId}_${dateTime.valueOf()}`;
    return btoa(input);
  }

  public static commitBatch(batch: FirebaseFirestore.WriteBatch): Promise<SomeResult<Array<FirebaseFirestore.WriteResult>>> {
    return batch.commit()
    .then(res => makeSuccess(res))
    .catch((err: Error) => makeError<Array<FirebaseFirestore.WriteResult>>(err.message));
  }
}