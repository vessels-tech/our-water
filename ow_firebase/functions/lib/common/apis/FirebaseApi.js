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
const AppProviderTypes_1 = require("../types/AppProviderTypes");
const FirebaseAdmin_1 = require("./FirebaseAdmin");
const ShortId_1 = require("../models/ShortId");
const sleep = require("thread-sleep");
const utils_1 = require("../utils");
const util_1 = require("util");
const ow_types_1 = require("ow_types");
class FirebaseApi {
    static batchSave(fs, docs) {
        return __awaiter(this, void 0, void 0, function* () {
            const batch = fs.batch();
            //Readings are unique by their timestamp + resourceId.
            docs.forEach(doc => doc.batchCreate(batch, fs, utils_1.hashReadingId(doc.resourceId, doc.timeseriesId, doc.datetime)));
            return batch.commit();
        });
    }
    /**
     * ResourcesNearLocation
     *
     * Get the resources near a given location
     */
    static resourcesNearLocation(orgId, latitude, longitude, distance) {
        return __awaiter(this, void 0, void 0, function* () {
            const distanceMultiplier = 100; //TODO: tune this value based on the queries we are getting back once we can see it a map
            const minLat = latitude - distanceMultiplier * distance;
            const minLng = longitude - distanceMultiplier * distance;
            const maxLat = latitude + distanceMultiplier * distance;
            const maxLng = longitude + distanceMultiplier * distance;
            console.log(`Coords are: min:(${minLat},${minLng}), max:(${maxLat},${maxLng}).`);
            return FirebaseAdmin_1.firestore.collection(`/org/${orgId}/resource`)
                .where('coords', '>=', new ow_types_1.OWGeoPoint(minLat, minLng))
                .where('coords', '<=', new ow_types_1.OWGeoPoint(maxLat, maxLng)).get()
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
                return {
                    type: AppProviderTypes_1.ResultType.SUCCESS,
                    result: resources,
                };
            })
                .catch(err => {
                return {
                    type: AppProviderTypes_1.ResultType.ERROR,
                    message: err.message,
                };
            });
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
    static getLongId(orgId, shortId) {
        return __awaiter(this, void 0, void 0, function* () {
            //TODO: update the lastUsed
            try {
                const result = yield FirebaseAdmin_1.firestore.collection('org').doc(orgId).collection(ShortId_1.default.docName).doc(shortId).get();
                if (util_1.isNullOrUndefined(result.data())) {
                    return {
                        type: AppProviderTypes_1.ResultType.ERROR,
                        message: `No id mapping found for orgId: ${orgId}, shortId: ${shortId}.`
                    };
                }
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
    static getShortId(orgId, longId) {
        return __awaiter(this, void 0, void 0, function* () {
            //TODO: update the lastUsed
            return FirebaseAdmin_1.firestore.collection('org').doc(orgId).collection(ShortId_1.default.docName)
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
                    return {
                        type: AppProviderTypes_1.ResultType.ERROR,
                        message: `Couldn't find a shortId for id: ${longId}`,
                    };
                }
                const shortId = shortIds[0];
                const shortIdObj = ShortId_1.default.deserialize(shortId);
                return {
                    type: AppProviderTypes_1.ResultType.SUCCESS,
                    result: shortIdObj
                };
            })
                .catch((err) => {
                return {
                    type: AppProviderTypes_1.ResultType.ERROR,
                    message: err.message,
                };
            });
        });
    }
    /**
     * CreateShortId
     *
     * Test of CreateShortId with Firebase Transactions
     */
    static createShortId(orgId, longId) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingShortIdResult = yield this.getShortId(orgId, longId);
            if (existingShortIdResult.type === AppProviderTypes_1.ResultType.SUCCESS) {
                return existingShortIdResult;
            }
            //I think the transactions handle the retries for us
            const lockRef = FirebaseAdmin_1.firestore.collection('org').doc(orgId).collection(ShortId_1.default.docName).doc('latest');
            let shortIdLock;
            let shortIdRef;
            let shortId;
            return FirebaseAdmin_1.firestore.runTransaction(tx => {
                return tx.get(lockRef)
                    .then(doc => {
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
                    shortIdRef = FirebaseAdmin_1.firestore.collection('org').doc(orgId).collection(ShortId_1.default.docName).doc(nextId);
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
                .then(result => {
                // console.log("TX success, result", result);
                return {
                    type: AppProviderTypes_1.ResultType.SUCCESS,
                    result: shortId
                };
            })
                .catch(err => {
                console.log("TX Error", err);
                return {
                    type: AppProviderTypes_1.ResultType.ERROR,
                    message: err.message,
                };
            });
        });
    }
    /**
     * CreateNewShortId
     *
     * Creates a new shortId for the given resource.
     * If there already is a ShortId for the resource, returns the existing one
     *
     * If this fails for any reason, will retry until retries is 0
     *
     * @returns ShortId, wrapped in a Promise & SomeResult
     */
    static dep_createShortId(orgId, longId, retries = 5, timeoutMs = 100) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`CreateShortId with retries: ${retries}, timeoutMs: ${timeoutMs}`);
            //0: Check to make sure the id hasn't already been created
            const existingShortIdResult = yield this.getShortId(orgId, longId);
            if (existingShortIdResult.type === AppProviderTypes_1.ResultType.SUCCESS) {
                return existingShortIdResult;
            }
            //1: Get the next short Id, ensure it's not locked. Retry if needed
            const result = yield FirebaseAdmin_1.firestore.collection('org').doc(orgId).collection(ShortId_1.default.docName).doc('latest').get();
            let shortIdLock = result.data();
            console.log("1. shortIdLock:", shortIdLock);
            //TODO: use timeout instead of lock
            if (!shortIdLock) {
                //This must be the first time
                shortIdLock = { id: '100000', lock: false };
                yield FirebaseAdmin_1.firestore.collection('org').doc(orgId).collection(ShortId_1.default.docName).doc('latest').set(shortIdLock);
            }
            else if (shortIdLock.lock === true) {
                console.log("lock is locked. Sleeping and trying again");
                if (retries === 0) {
                    return {
                        type: AppProviderTypes_1.ResultType.ERROR,
                        message: 'createShortId out of retries',
                    };
                }
                sleep(timeoutMs);
                return this.dep_createShortId(orgId, longId, retries - 1, timeoutMs * 2);
            }
            const lockRef = FirebaseAdmin_1.firestore.collection('org').doc(orgId).collection(ShortId_1.default.docName).doc('latest');
            const nextId = utils_1.pad(parseInt(shortIdLock.id) + 1, 9);
            const shortIdRef = FirebaseAdmin_1.firestore.collection('org').doc(orgId).collection(ShortId_1.default.docName).doc(nextId);
            const shortId = ShortId_1.default.fromShortId(orgId, {
                shortId: nextId,
                longId,
                lastUsed: new Date(),
            });
            try {
                yield lockRef.set({ id: nextId, lock: true });
                yield shortIdRef.set(shortId.serialize());
                yield lockRef.set({ lock: false });
                return {
                    type: AppProviderTypes_1.ResultType.SUCCESS,
                    result: shortId,
                };
            }
            catch (err) {
                console.log("Error", err);
                return {
                    type: AppProviderTypes_1.ResultType.ERROR,
                    message: err.message,
                };
            }
            // const batch = firestore.batch();
            // batch.update(lockRef, {id: nextId, lock: true });
            // batch.set(shortIdRef, shortId.serialize());
            // //I'm not 100% sure this will work as intended
            // batch.update(lockRef, { id: nextId, lock: false });
            // return batch.commit()
            // .then((batchResult: any) => {
            //   console.log("batchResult", batchResult);
            //   return {
            //     type: ResultType.SUCCESS,
            //     result: shortId,
            //   }
            // })
            // .catch((err: any) => {
            //   console.log("error saving batch: ", err);
            //   return {
            //     type: ResultType.ERROR,
            //     message: err.message
            //   }
            // });
        });
    }
}
exports.default = FirebaseApi;
//# sourceMappingURL=FirebaseApi.js.map