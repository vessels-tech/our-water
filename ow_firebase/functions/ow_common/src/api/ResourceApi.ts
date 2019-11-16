import { SomeResult, makeError, makeSuccess, ResultType, ErrorResult } from "../utils/AppProviderTypes";
import * as admin from "firebase-admin";
import { Resource, DefaultResource } from "../model";
import { DocumentReference } from "@google-cloud/firestore";

type Firestore = admin.firestore.Firestore;

export class ResourceApi {
  private firestore: Firestore;
  private orgId: string;


  constructor(firestore: Firestore, orgId: string) {
    this.firestore = firestore;
    this.orgId = orgId;
  }

  public async getResourceForId(resourceId: string): Promise<SomeResult<Resource>>{
    return this.getResource(this.resourceRef(resourceId));
  }

  public async getResourcesForIds(resourceIds: string[]): Promise<SomeResult<Array<Resource>>> {
    const results =  await Promise.all(resourceIds.map(id => this.getResourceForId(id)));

    const errors: ErrorResult[] = [];
    const resources: Resource[] = [];
    results.forEach(r => {
      if (r.type === ResultType.ERROR) {
        errors.push(r);
        return;
      }

      resources.push(r.result);
    });

    if (errors.length > 0) {
      return makeError<Array<Resource>>(`Error getting resources: ${errors.reduce((acc, curr) => `${acc}, ${curr}`, '')}`);
    }

    return makeSuccess<Array<Resource>>(resources);
  }

  //
  // Helpers
  // ------------------------------------
  
  public resourceRef(resourceId?: string): DocumentReference {
    if (!resourceId) {
      return this.firestore.collection('org').doc(this.orgId).collection('resource').doc();
    }

    return this.firestore.collection('org').doc(this.orgId).collection('resource').doc(resourceId);
  }

  public async getResource(resourceRef: DocumentReference): Promise<SomeResult<Resource>> {
    return resourceRef.get()
    .then(sn => {
      const data = sn.data();
      if (!data) {
        return makeError<Resource>(`No data found for resourceRef: ${resourceRef}`);
      }

      return makeSuccess({
        ...DefaultResource,
        ...data,
        id: sn.id,
      });
    })
    .catch((err: Error) => makeError<Resource>(err.message))
  }

}