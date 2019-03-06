"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const AppProviderTypes_1 = require("ow_common/lib/utils/AppProviderTypes");
const Resource_1 = require("../models/Resource");
const ShortId_1 = require("../models/ShortId");
const utils_1 = require("../utils");
const util_1 = require("util");
const admin = require("firebase-admin");
const Reading_1 = require("../models/Reading");
const moment = require("moment");
const model_1 = require("ow_common/lib/model");
const api_1 = require("ow_common/lib/api");
const ResourceStationType_1 = require("ow_common/lib/enums/ResourceStationType");
const utils_2 = require("ow_common/lib/utils");
function makePageResult(startAfter, hasNext, result) {
    return {
        result,
        hasNext,
        startAfter,
    };
}
exports.makePageResult = makePageResult;
class FirebaseApi {
    constructor(firestore) {
        this.firestore = firestore;
    }
    batchSaveResources(docs) {
        if (docs.length === 0) {
            console.log('WARN: Tried to save a batch of resources, but resources was empty.');
            return Promise.resolve([]);
        }
        const batch = this.firestore.batch();
        //Pass in the resourceId here - very low chance of colission
        // docs.forEach(doc => doc.batchCreate(batch, this.firestore, doc.id));
        docs.forEach(doc => {
            console.log("creating in batch", doc.id);
            doc.batchCreate(batch, this.firestore, doc.id);
        });
        return batch.commit();
    }
    batchSaveReadings(docs) {
        return __awaiter(this, void 0, void 0, function* () {
            if (docs.length === 0) {
                console.log('WARN: Tried to save a batch of readings, but readings was empty.');
                return Promise.resolve([]);
            }
            const batch = this.firestore.batch();
            //Readings are unique by their timestamp + resourceId.
            docs.forEach(doc => {
                doc.batchCreate(batch, this.firestore, api_1.ReadingApi.hashReadingId(doc.resourceId, doc.timeseriesId, doc.datetime));
            });
            return batch.commit();
        });
    }
    /**
     *
     * @param fs
     * @param docs
     * @param docIds - optional. If provided, will use these ids instead of the doc's id
     */
    batchDelete(fs, docs, docIds) {
        return __awaiter(this, void 0, void 0, function* () {
            if (docs.length === 0) {
                console.warn('Tried to save a batch of resources, but readings was empty.');
                return Promise.resolve(true);
            }
            const batch = fs.batch();
            if (docIds && docIds.length !== docs.length) {
                return Promise.reject(new Error("docs.length and docIds.length must match"));
            }
            if (docIds) {
                docs.forEach((doc, idx) => {
                    const id = docIds[idx];
                    doc.batchDelete(batch, this.firestore, id);
                });
            }
            else {
                docs.forEach(doc => doc.batchDelete(batch, this.firestore));
            }
            return batch.commit();
        });
    }
    /**
     * ResourcesNearLocation
     *
     * Get the resources near a given location
     */
    resourcesNearLocation(orgId, latitude, longitude, distance) {
        return __awaiter(this, void 0, void 0, function* () {
            const distanceMultiplier = 100; //TODO: tune this value based on the queries we are getting back once we can see it a map
            const minLat = latitude - distanceMultiplier * distance;
            const minLng = longitude - distanceMultiplier * distance;
            const maxLat = latitude + distanceMultiplier * distance;
            const maxLng = longitude + distanceMultiplier * distance;
            return this.firestore.collection(`/org/${orgId}/resource`)
                .where('coords', '>=', new admin.firestore.GeoPoint(minLat, minLng))
                .where('coords', '<=', new admin.firestore.GeoPoint(maxLat, maxLng)).get()
                .then(snapshot => {
                const resources = [];
                snapshot.forEach(doc => {
                    const data = doc.data();
                    data.id = doc.id;
                    // Filter based on longitude. TODO: remove this once google fixes this query
                    if (data.coords._longitude < minLng || data.coords._longitude > maxLng) {
                        return;
                    }
                    resources.push(data);
                });
                return AppProviderTypes_1.makeSuccess(resources);
            })
                .catch(err => AppProviderTypes_1.makeError(err.message));
        });
    }
    /**
     * Readings In Bounding Box
     *
     * Get the readings taken within a bounding box
     */
    readingsWithinBoundingBox(orgId, bbox, pageParams) {
        return __awaiter(this, void 0, void 0, function* () {
            const { minLat, minLng, maxLat, maxLng } = bbox;
            return this.firestore.collection(`/org/${orgId}/reading`)
                .where('coords', '>=', new admin.firestore.GeoPoint(minLat, minLng))
                .where('coords', '<=', new admin.firestore.GeoPoint(maxLat, maxLng))
                //We need to order by coords to make sure the pagination works
                .orderBy('coords')
                //TODO: implement pagination
                .limit(pageParams.limit)
                .get()
                .then(snapshot => {
                const readings = [];
                snapshot.forEach(doc => {
                    const data = doc.data();
                    data.id = doc.id;
                    // Filter based on longitude. TODO: remove this once google fixes this query
                    if (data.coords._longitude < minLng || data.coords._longitude > maxLng) {
                        return;
                    }
                    readings.push(data);
                });
                return AppProviderTypes_1.makeSuccess(readings);
            })
                .catch(err => AppProviderTypes_1.makeError(err.message));
        });
    }
    /**
     * Readings In Bounding Box
     *
     * Get the readings taken within a bounding box
     */
    readingsWithinBoundingBoxPaginated(orgId, bbox, pageParams) {
        return __awaiter(this, void 0, void 0, function* () {
            const { minLat, minLng, maxLat, maxLng } = bbox;
            // console.log(`Coords are: min:(${minLat},${minLng}), max:(${maxLat},${maxLng}).`);
            return Promise.resolve()
                .then(() => {
                if (pageParams.startAfter) {
                    return this.firestore.collection(`/org/${orgId}/reading`)
                        .where('coords', '>=', new admin.firestore.GeoPoint(minLat, minLng))
                        .where('coords', '<=', new admin.firestore.GeoPoint(maxLat, maxLng))
                        //We need to order by coords to make sure the pagination works
                        .orderBy('coords')
                        .startAfter(pageParams.startAfter)
                        .limit(pageParams.limit)
                        .get();
                }
                return this.firestore.collection(`/org/${orgId}/reading`)
                    .where('coords', '>=', new admin.firestore.GeoPoint(minLat, minLng))
                    .where('coords', '<=', new admin.firestore.GeoPoint(maxLat, maxLng))
                    //We need to order by coords to make sure the pagination works
                    .orderBy('coords')
                    .limit(pageParams.limit)
                    .get();
            })
                .then(snapshot => {
                const readings = [];
                snapshot.forEach(doc => {
                    const data = doc.data();
                    data.id = doc.id;
                    // Filter based on longitude. TODO: remove this once google fixes this query
                    if (data.coords._longitude < minLng || data.coords._longitude > maxLng) {
                        // return;
                    }
                    readings.push(data);
                });
                const startAfter = snapshot.docs[snapshot.docs.length - 1];
                let hasNext = false;
                if (snapshot.docs.length === pageParams.limit) {
                    hasNext = true;
                }
                const result = AppProviderTypes_1.makeSuccess(makePageResult(startAfter, hasNext, readings));
                return result;
            })
                .catch(err => AppProviderTypes_1.makeError(err.message));
        });
    }
    //
    // ShortId
    // ----------------------------------------
    /**
     * GetLongId
     *
     * Get the longId given a short Id and orgId
     */
    getLongId(orgId, shortId) {
        return __awaiter(this, void 0, void 0, function* () {
            //TODO: update the lastUsed
            try {
                const result = yield this.firestore.collection('org').doc(orgId).collection(ShortId_1.default.docName).doc(shortId).get();
                if (util_1.isNullOrUndefined(result.data())) {
                    return {
                        type: AppProviderTypes_1.ResultType.ERROR,
                        message: `No id mapping found for orgId: ${orgId}, shortId: ${shortId}.`
                    };
                }
                //@ts-ignore
                const shortIdObj = ShortId_1.default.deserialize(result.data());
                return {
                    type: AppProviderTypes_1.ResultType.SUCCESS,
                    result: shortIdObj.longId,
                };
            }
            catch (err) {
                return {
                    type: AppProviderTypes_1.ResultType.ERROR,
                    message: err.message,
                };
            }
        });
    }
    /**
     * GetShortId
     *
     * Get the shortId given the longId and orgId
     */
    getShortId(orgId, longId) {
        return __awaiter(this, void 0, void 0, function* () {
            //TODO: update the lastUsed
            return this.firestore.collection('org').doc(orgId).collection(ShortId_1.default.docName)
                .where('longId', '==', longId).get()
                .then((snapshot) => {
                const shortIds = [];
                snapshot.forEach(doc => {
                    const data = doc.data();
                    data.id = doc.id;
                    shortIds.push(data);
                });
                if (shortIds.length > 0) {
                    console.warn(`found more than 1 short id for longId ${longId}. Returning the first only.`);
                }
                if (shortIds.length === 0) {
                    return AppProviderTypes_1.makeError(`Couldn't find a shortId for id: ${longId}`);
                }
                const shortId = shortIds[0];
                const shortIdObj = ShortId_1.default.deserialize(shortId);
                return AppProviderTypes_1.makeSuccess(shortIdObj);
            })
                .catch((err) => AppProviderTypes_1.makeError(err.message));
        });
    }
    /**
     * CreateShortId
     *
     * Test of CreateShortId with Firebase Transactions
     */
    createShortId(orgId, longId) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingShortIdResult = yield this.getShortId(orgId, longId);
            if (existingShortIdResult.type === AppProviderTypes_1.ResultType.SUCCESS) {
                return existingShortIdResult;
            }
            //I think the transactions handle the retries for us
            const lockRef = this.firestore.collection('org').doc(orgId).collection(ShortId_1.default.docName).doc('latest');
            let shortIdLock;
            let shortIdRef;
            let shortId;
            return this.firestore.runTransaction(tx => {
                return tx.get(lockRef)
                    .then(doc => {
                    //@ts-ignore
                    shortIdLock = doc.data();
                    //Lock has never been created. Set to initial value
                    if (!shortIdLock) {
                        shortIdLock = { id: '100000', lock: false };
                        return tx.set(lockRef, shortIdLock);
                    }
                    //Another write is currently happening
                    if (shortIdLock.lock === true) {
                        //Hopefully throwing an error here will make the tx retry
                        console.log(`tx is locked for shortIdLock: ${shortIdLock}.`);
                        throw new Error(`tx is locked for shortIdLock: ${shortIdLock}.`);
                    }
                })
                    .then(() => {
                    //Lock:
                    shortIdLock.lock = true;
                    return tx.set(lockRef, shortIdLock);
                })
                    .then(() => {
                    //Set the new value
                    const nextId = utils_1.pad(parseInt(shortIdLock.id) + 1, 9);
                    shortIdRef = this.firestore.collection('org').doc(orgId).collection(ShortId_1.default.docName).doc(nextId);
                    shortId = ShortId_1.default.fromShortId(orgId, {
                        shortId: nextId,
                        longId,
                        lastUsed: new Date(),
                    });
                    return tx.set(shortIdRef, shortId.serialize());
                })
                    .then(() => {
                    //Unlock
                    return tx.set(lockRef, { id: shortId.shortId, lock: false });
                });
            })
                .then(result => AppProviderTypes_1.makeSuccess(shortId))
                .catch((err) => {
                console.log("TX Error", err);
                return AppProviderTypes_1.makeError(err.message);
            });
        });
    }
    /**
     * Change the user's status
     */
    changeUserStatus(orgId, userId, status) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.firestore.collection('org').doc(orgId).collection('user').doc(userId).set({ status }, { merge: true })
                .then(() => AppProviderTypes_1.makeSuccess(undefined))
                .catch(err => AppProviderTypes_1.makeError(err.message));
        });
    }
    /**
     * syncPendingForUser
     *
     * Save the user's pendingResources and pendingReadings and delete from their collection in user.
     * returns an array of pending resources
     */
    syncPendingForUser(orgId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const errorResults = [];
            //Get the user's pending resources and readings
            const pendingResourceResult = yield this.getPendingResources(orgId, userId);
            const pendingReadingsResult = yield this.getPendingReadings(orgId, userId);
            let pendingResources;
            let pendingReadings;
            if (pendingResourceResult.type === AppProviderTypes_1.ResultType.ERROR) {
                errorResults.push(pendingResourceResult);
            }
            else {
                pendingResources = pendingResourceResult.result;
            }
            if (pendingReadingsResult.type === AppProviderTypes_1.ResultType.ERROR) {
                errorResults.push(pendingReadingsResult);
            }
            else {
                pendingReadings = pendingReadingsResult.result;
            }
            if (errorResults.length > 0) {
                console.log("Error: ", errorResults);
                return Promise.resolve(AppProviderTypes_1.makeError(errorResults.reduce((acc, curr) => `${acc} ${curr.message},\n`, '')));
            }
            //map them to the Firebase Domain (if needed)
            //Save to public
            let batchResultResources;
            try {
                batchResultResources = yield this.batchSaveResources(pendingResources);
            }
            catch (err) {
                errorResults.push({ type: AppProviderTypes_1.ResultType.ERROR, message: err });
            }
            //TODO: transform the and pendingReadings where isResourcePending=true, and substitue the new resourceId.
            let batchResultReadings;
            try {
                batchResultReadings = yield this.batchSaveReadings(pendingReadings);
            }
            catch (err) {
                errorResults.push({ type: AppProviderTypes_1.ResultType.ERROR, message: err });
            }
            if (errorResults.length > 0) {
                console.log("Error: ", errorResults);
                return Promise.resolve(AppProviderTypes_1.makeError(errorResults.reduce((acc, curr) => `${acc} ${curr.message},\n`, '')));
            }
            //Delete pending resources and readings
            //We get them again since our first array has been modified in place.
            const pendingResourceResult2 = yield this.getPendingResources(orgId, userId);
            const pendingReadingsResult2 = yield this.getPendingReadings(orgId, userId);
            if (pendingResourceResult2.type === AppProviderTypes_1.ResultType.ERROR) {
                errorResults.push(pendingResourceResult2);
            }
            if (pendingReadingsResult2.type === AppProviderTypes_1.ResultType.ERROR) {
                errorResults.push(pendingReadingsResult2);
            }
            if (errorResults.length > 0) {
                console.log("Error: ", errorResults);
                return Promise.resolve(AppProviderTypes_1.makeError(errorResults.reduce((acc, curr) => `${acc} ${curr.message},\n`, '')));
            }
            //@ts-ignore
            const deleteResourcesResult = yield this.batchDeletePendingResources(orgId, userId, pendingResourceResult2.result);
            //@ts-ignore
            const deleteReadingsResult = yield this.batchDeletePendingReadings(orgId, userId, pendingReadingsResult2.result);
            if (deleteResourcesResult.type === AppProviderTypes_1.ResultType.ERROR) {
                errorResults.push(deleteResourcesResult);
            }
            if (deleteReadingsResult.type === AppProviderTypes_1.ResultType.ERROR) {
                errorResults.push(deleteReadingsResult);
            }
            if (errorResults.length > 0) {
                console.log("Error: ", errorResults);
                return Promise.resolve(AppProviderTypes_1.makeError(errorResults.reduce((acc, curr) => `${acc} ${curr.message},\n`, '')));
            }
            //This will always be true, otherwise we would have errors
            const savedResourceIds = [];
            if (pendingResourceResult2.type === AppProviderTypes_1.ResultType.SUCCESS) {
                pendingResourceResult2.result.forEach(r => savedResourceIds.push(r.id));
            }
            return AppProviderTypes_1.makeSuccess(savedResourceIds);
        });
    }
    preProcessRawReading(raw) {
        const dateStr = `${raw.date}T${raw.time}`;
        const dateMoment = moment.utc(dateStr, 'YYYY/MM/DDTHH:mm');
        let value;
        let message = "";
        if (!dateMoment.isValid()) {
            message += `Date and time format is invalid. `;
        }
        if (!raw.value || raw.value === "") {
            message += `Value is empty. `;
        }
        else {
            try {
                value = parseFloat(raw.value);
                if (isNaN(value)) {
                    throw new Error("NaN error");
                }
            }
            catch (err) {
                message += `Value is invalid. `;
            }
        }
        if (!raw.timeseries) {
            message += `Timeseries is empty. `;
        }
        if (!raw.shortId && !raw.id && !(raw.legacyPincode && raw.legacyResourceId)) {
            message += `One of shortId, id, or legacyPincode AND legacyResourceId is required. `;
        }
        if (raw.shortId && raw.shortId.length < 9 || raw.shortId.indexOf("-") > -1) {
            message += `ShortId is invalid, should be a 9 digit number. `;
        }
        //return here if we have errors
        if (message !== "") {
            return AppProviderTypes_1.makeError(message);
        }
        return AppProviderTypes_1.makeSuccess({
            type: model_1.ReadingType.MyWell,
            datetime: dateMoment.toISOString(),
            resourceId: 'dunno',
            resourceType: ResourceStationType_1.default.checkdam,
            timeseriesId: raw.timeseries,
            value,
        });
    }
    getIdForRawReading(orgId, raw) {
        return __awaiter(this, void 0, void 0, function* () {
            if (raw.id) {
                return Promise.resolve(AppProviderTypes_1.makeSuccess(raw.id));
            }
            /* lookup shortId */
            //TODO: handle nice formatting
            if (raw.shortId) {
                const shortIdResult = yield this.shortIdCol(orgId).doc(raw.shortId).get()
                    .then(doc => {
                    const data = doc.data();
                    if (!data || !data.longId) {
                        return AppProviderTypes_1.makeError("No longId found for shortId");
                    }
                    return AppProviderTypes_1.makeSuccess(data.longId);
                })
                    .catch((err) => AppProviderTypes_1.makeError(err.message));
                return shortIdResult;
            }
            if (raw.legacyPincode && raw.legacyResourceId) {
                const legacyLookupResult = yield this.resourceCol(orgId).where('externalIds.legacyMyWellId', "==", `${raw.legacyPincode}.${raw.legacyResourceId}`).get()
                    .then(sn => {
                    if (sn.empty) {
                        return AppProviderTypes_1.makeError(`No resource found for ${raw.legacyPincode}.${raw.legacyResourceId}`);
                    }
                    if (sn.size > 1) {
                        return AppProviderTypes_1.makeError(`Found duplicate resources for ${raw.legacyPincode}.${raw.legacyResourceId}`);
                    }
                    return AppProviderTypes_1.makeSuccess(sn.docs[0].id);
                });
                return legacyLookupResult;
            }
            //If we got to this point, then an unknown error occoured
            return AppProviderTypes_1.makeError("Unkown error occoured. Perhaps the incorrect fields were specified.");
        });
    }
    /**
     * getResourceMaybeCached
     *
     * When saving bulk readings, we need to enrich the readings data from the original resource
     * TODO: implement a cache so we don't keep on having to hit the db.
     */
    getResourceMaybeCached(orgId, resourceId) {
        return __awaiter(this, void 0, void 0, function* () {
            const resourceApi = new api_1.ResourceApi(this.firestore, orgId);
            //TODO: add temp cache layer
            return resourceApi.getResource(resourceApi.resourceRef(resourceId));
        });
    }
    /**
     * validateBulkUploadReadings
     *
     * Validate a dataset before performing a bulk upload.
     * Possible validation errors include:
     * - wrong date format
     * - no value, or invalid value
     * - no timeseriesId
     * - none of shortId, id, or legacyPincode + legacyResourceId
     * - can't find id for short id or legacyPincode + legacyResourceId
     *
     *
     * @param orgId
     * @param userId
     * @param rawReadings
     */
    validateBulkUploadReadings(orgId, userId, rawReadings) {
        return __awaiter(this, void 0, void 0, function* () {
            const warnings = [];
            const validated = [];
            //TODO: this leaves off the last value!
            yield rawReadings.reduce((acc, raw, idx) => __awaiter(this, void 0, void 0, function* () {
                yield acc;
                const preprocessResult = this.preProcessRawReading(raw);
                if (preprocessResult.type === AppProviderTypes_1.ResultType.ERROR) {
                    warnings.push({ raw, message: preprocessResult.message });
                    return Promise.resolve(preprocessResult);
                }
                const getIdResult = yield this.getIdForRawReading(orgId, raw);
                if (getIdResult.type === AppProviderTypes_1.ResultType.ERROR) {
                    warnings.push({ raw, message: getIdResult.message });
                    return Promise.resolve(getIdResult);
                }
                const getResourceResult = yield this.getResourceMaybeCached(orgId, getIdResult.result);
                if (getResourceResult.type === AppProviderTypes_1.ResultType.ERROR) {
                    warnings.push({ raw, message: getResourceResult.message });
                    return Promise.resolve(getIdResult);
                }
                validated.push(Object.assign({}, model_1.DefaultReading, preprocessResult.result, { resourceId: getResourceResult.result.id, 
                    //This is still less than ideal
                    resourceType: utils_2.safeGetNested(getResourceResult.result, ['resourceType']), type: model_1.ReadingType.MyWell }));
                // return this.getIdForRawReading(orgId, raw)
                // .then(result => {
                //   if (result.type === ResultType.ERROR) {
                //     warnings.push({ raw, message: result.message });
                //   }
                //   if (result.type === ResultType.SUCCESS && result.result) {
                //     validated.push({
                //       ...DefaultReading,
                //       //TODO: parse properly with raw
                //       ...preprocessResult.result,
                //       resourceId: result.result,
                //     });
                //   }
                // })
            }), Promise.resolve(AppProviderTypes_1.makeSuccess(undefined)));
            return AppProviderTypes_1.makeSuccess({ warnings, validated });
        });
    }
    //
    // COMMON - Can be refactored to combine with front end Firebase Api
    //------------------------------------------------------------------------
    /**
     * getPendingResources
     *
     * Get the Pending Resources from the user's object.
     *
     * @param orgId
     * @param userId
     */
    getPendingResources(orgId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.userDoc(orgId, userId).collection('pendingResources').get()
                .then((sn) => {
                const resources = [];
                //TODO: not sure if deser will work
                sn.forEach((doc) => resources.push(Resource_1.Resource.fromDoc(doc, doc.id)));
                return AppProviderTypes_1.makeSuccess(resources);
            })
                .catch((err) => AppProviderTypes_1.makeError(err.message + err.stack));
        });
    }
    /**
     * getPendingReadings
     *
     * Get the Pending Readings from the user's object.
     *
     * @param orgId
     * @param userId
     */
    getPendingReadings(orgId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.userDoc(orgId, userId).collection('pendingReadings').get()
                .then((sn) => {
                const readings = [];
                //TODO: not sure if deser will work
                sn.forEach((doc) => readings.push(Reading_1.Reading.deserialize(doc, doc.id)));
                return AppProviderTypes_1.makeSuccess(readings);
            })
                .catch((err) => AppProviderTypes_1.makeError(err.message + err.stack));
        });
    }
    /**
    * deletePendingResource
    *
    * Delete a pending resource from the user's pending resource list
    */
    deletePendingResourceFromUser(orgId, userId, resourceId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.userDoc(orgId, userId).collection('pendingResources').doc(resourceId).delete()
                .then(() => AppProviderTypes_1.makeSuccess(undefined))
                .catch((err) => AppProviderTypes_1.makeError(err.message));
        });
    }
    /**
     * batchDeletePendingResources
     *
     * Delete an array of pending Resources in a batch
     *
     * @param orgId
     * @param userId
     * @param resources
     */
    batchDeletePendingResources(orgId, userId, resources) {
        if (resources.length === 0) {
            console.warn('Tried to delete a batch of resources, but resources was empty.');
            return Promise.resolve(AppProviderTypes_1.makeSuccess(undefined));
        }
        const batch = this.firestore.batch();
        resources.forEach(r => {
            const ref = this.firestore.collection('org').doc(orgId).collection('user').doc(userId).collection('pendingResources').doc(r.id);
            batch.delete(ref);
        });
        return batch.commit()
            .then((res) => AppProviderTypes_1.makeSuccess(undefined))
            .catch((error) => AppProviderTypes_1.makeError(error.message + error.stack));
    }
    /**
     * batchDeletePendingReadings
     *
     * Delete an array of pending Resources in a batch
     *
     * @param orgId
     * @param userId
     * @param readings
     */
    batchDeletePendingReadings(orgId, userId, readings) {
        if (readings.length === 0) {
            console.warn('Tried to delete a batch of readings, but readings was empty.');
            return Promise.resolve(AppProviderTypes_1.makeSuccess(undefined));
        }
        const batch = this.firestore.batch();
        readings.forEach(r => {
            const ref = this.firestore.collection('org').doc(orgId).collection('user').doc(userId).collection('pendingReadings').doc(r.id);
            batch.delete(ref);
        });
        return batch.commit()
            .then(() => AppProviderTypes_1.makeSuccess(undefined))
            .catch((error) => AppProviderTypes_1.makeError(error.message + error.stack));
    }
    /**
     * Doc shortcuts
     */
    userDoc(orgId, userId) {
        return this.firestore.collection('org').doc(orgId).collection('user').doc(userId);
    }
    resourceCol(orgId) {
        return this.firestore.collection('org').doc(orgId).collection('resource');
    }
    readingCol(orgId) {
        return this.firestore.collection('org').doc(orgId).collection('reading');
    }
    shortIdCol(orgId) {
        return this.firestore.collection('org').doc(orgId).collection('shortId');
    }
}
exports.default = FirebaseApi;
//# sourceMappingURL=FirebaseApi.js.map