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
const Firestore_1 = require("./Firestore");
const OWGeoPoint_1 = require("../models/OWGeoPoint");
class FirebaseApi {
    static resourcesNearLocation(orgId, latitude, longitude, distance) {
        return __awaiter(this, void 0, void 0, function* () {
            const distanceMultiplier = 100; //TODO: tune this value based on the queries we are getting back once we can see it a map
            const minLat = latitude - distanceMultiplier * distance;
            const minLng = longitude - distanceMultiplier * distance;
            const maxLat = latitude + distanceMultiplier * distance;
            const maxLng = longitude + distanceMultiplier * distance;
            console.log(`Coords are: min:(${minLat},${minLng}), max:(${maxLat},${maxLng}).`);
            return Firestore_1.default.collection(`/org/${orgId}/resource`)
                .where('coords', '>=', new OWGeoPoint_1.default(minLat, minLng))
                .where('coords', '<=', new OWGeoPoint_1.default(maxLat, maxLng)).get()
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
}
exports.default = FirebaseApi;
//# sourceMappingURL=FirebaseApi.js.map