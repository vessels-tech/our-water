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
const validate = require("express-validation");
const express = require("express");
const cors = require("cors");
const moment = require("moment");
const Group_1 = require("../../common/models/Group");
const GroupType_1 = require("../../common/enums/GroupType");
const Resource_1 = require("../../common/models/Resource");
const util_1 = require("util");
const ResourceIdType_1 = require("../../common/types/ResourceIdType");
const ResourceType_1 = require("../../common/enums/ResourceType");
const FirebaseApi_1 = require("../../common/apis/FirebaseApi");
const AppProviderTypes_1 = require("../../common/types/AppProviderTypes");
const Firestore_1 = require("../../common/apis/Firestore");
const ErrorHandler_1 = require("../../common/ErrorHandler");
//@ts-ignore
const morgan = require("morgan");
//@ts-ignore
const morganBody = require("morgan-body");
const validation_1 = require("./validation");
const EmailApi_1 = require("../../common/apis/EmailApi");
const ow_types_1 = require("ow_types");
const GGMNApi_1 = require("../../common/apis/GGMNApi");
const middleware_1 = require("../../middleware");
const bodyParser = require('body-parser');
const Joi = require('joi');
const fb = require('firebase-admin');
require('express-async-errors');
module.exports = (functions) => {
    const app = express();
    app.use(bodyParser.json());
    if (process.env.VERBOSE_LOG === 'false') {
        console.log('Using simple log');
        app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));
    }
    else {
        console.log('Using verbose log');
        morganBody(app);
    }
    app.use(middleware_1.validateFirebaseIdToken);
    const getOrgs = (orgId, last_createdAt = moment().valueOf(), limit = 25) => {
        return Firestore_1.default.collection('org').doc(orgId)
            .collection('resource')
            .orderBy('createdAt')
            .startAfter(last_createdAt)
            .limit(limit)
            .get();
    };
    /**
     * return all the resources in a given organisation, containing the latest reading
     */
    app.get('/:orgId', (req, res, next) => {
        const orgId = req.params.orgId;
        const { last_createdAt, limit } = req.query;
        // const resourceRef = firestore.collection('org').doc(orgId).collection('resource');
        return getOrgs(orgId, last_createdAt, limit)
            .then(snapshot => {
            const resources = [];
            snapshot.forEach(function (doc) {
                resources.push(doc.data());
            });
            //Sadly this doesn't give us the nested reading.
            //It also doesn't give us the document containing the resources...
            //One way to do this would be to store readings in an array on this object, but I'm worried about performance issues
            return res.json(resources);
        })
            .catch(err => next(err));
    });
    app.get('/:orgId/test', (req, res, next) => {
        console.log("running TEST function");
        const orgId = req.params.orgId;
        // Try saving a new group
        const coords = [
            new ow_types_1.OWGeoPoint(34.34, -115.67),
        ];
        const group = new Group_1.Group('5000', orgId, GroupType_1.GroupType.Pincode, coords, null);
        return group.create({ firestore: Firestore_1.default })
            .then((saved) => res.json(saved));
    });
    /**
     * createResource
     *
     * Creates a new resource for a given org
     *
     *  Example:
     *  {
     *    "coords": {"latitude":13.2, "longitude":45.4},
     *    "type": "well",
     *    "owner": { "name": "Ram Ji"},
     *    "imageUrl": "s3://location",
     *    "groups": {
     *       "9waUCZJIDvGXJzAi64BX": true
     *     }
     *  }
     */
    const createResourceValidation = {
        options: {
            allowUnknownBody: false,
        },
        body: {
            //This is annoying...
            data: {
                coords: Joi.object().keys({
                    latitude: Joi.number().required(),
                    longitude: Joi.number().required(),
                }).required(),
                //TODO: make proper enums
                owner: Joi.object().keys({
                    name: Joi.string().required(),
                }),
                groups: Joi.object().optional(),
                imageUrl: Joi.string().optional(),
                //We will create an index on this to make this backwards compatible with MyWell
                legacyId: Joi.string().optional(),
                type: Joi.valid('well', 'raingauge', 'checkdam').required()
            },
        }
    };
    app.post('/:orgId/', validate(createResourceValidation), (req, res, next) => {
        const orgId = req.params.orgId;
        //Ensure geopoints get added properly
        const oldCoords = req.body.data.coords;
        const newCoords = new fb.firestore.GeoPoint(oldCoords.latitude, oldCoords.longitude);
        req.body.data.coords = newCoords;
        console.log("org id:", orgId);
        //Add default lastReading
        req.body.data.lastValue = 0;
        req.body.data.lastReadingDatetime = new Date(0);
        //Ensure the orgId exists
        const orgRef = Firestore_1.default.collection('org').doc(orgId);
        return orgRef.get()
            .then(doc => {
            if (!doc.exists) {
                throw new Error(`Org with id: ${orgId} not found`);
            }
        })
            .then(() => Firestore_1.default.collection(`/org/${orgId}/resource`).add(req.body.data))
            .then(result => {
            console.log(JSON.stringify({ resourceId: result.id }));
            return res.json({ resource: result.id });
        })
            .catch(err => next(err));
    });
    /**
     * updateResource
     * PUT /:orgId/:resourceId
     */
    const updateResourceValidation = {
        options: {
            allowUnknownBody: true,
        },
        body: {
            //This is annoying...
            data: {
                coords: Joi.object().keys({
                    _latitude: Joi.number().optional(),
                    _longitude: Joi.number().optional(),
                }).optional(),
                owner: Joi.object().keys({
                    name: Joi.string().optional(),
                    createdByUserId: Joi.string().optional(),
                }).optional(),
                externalIds: Joi.object().optional(),
                imageUrl: Joi.string().optional(),
                resourceType: Joi.valid('well', 'raingauge', 'checkdam').optional()
            },
        }
    };
    app.put('/:orgId/:resourceId', validate(updateResourceValidation), (req, res, next) => __awaiter(this, void 0, void 0, function* () {
        const { orgId, resourceId } = req.params;
        const newData = req.body.data;
        console.log("orgId", orgId);
        console.log("resourceId", resourceId);
        console.log("newData", JSON.stringify(newData, null, 2));
        try {
            //get the resource
            const resource = yield Resource_1.Resource.getResource({ orgId, id: resourceId, firestore: Firestore_1.default });
            const modifiableKeys = ['owner', 'externalIds', 'resourceType', 'coords'];
            modifiableKeys.forEach(key => {
                let newValue = newData[key];
                if (util_1.isNullOrUndefined(newValue)) {
                    return;
                }
                if (key === 'externalIds') {
                    newValue = ResourceIdType_1.default.deserialize(newValue);
                }
                if (key === 'resourceType') {
                    newValue = ResourceType_1.resourceTypeFromString(newValue);
                }
                resource[key] = newValue;
            });
            yield resource.save({ firestore: Firestore_1.default });
            return res.json(resource);
        }
        catch (err) {
            next(err);
            return;
        }
    }));
    app.post('/:orgId/ggmnResourceEmail', validate(validation_1.ggmnResourceEmailValidation), (req, res) => __awaiter(this, void 0, void 0, function* () {
        //TODO: build an email and send it.
        const pendingResources = req.body.pendingResources;
        const generateZipResult = yield GGMNApi_1.default.pendingResourcesToZip(pendingResources);
        if (generateZipResult.type === AppProviderTypes_1.ResultType.ERROR) {
            throw new Error(generateZipResult.message);
        }
        const attachments = [{
                filename: 'id.zip',
                //TODO: insert path
                path: generateZipResult.result,
            }];
        const sendEmailResult = yield EmailApi_1.default.sendResourceEmail(req.body.email, 'HELLO', attachments);
        if (sendEmailResult.type === AppProviderTypes_1.ResultType.ERROR) {
            console.log("Error sending emails:", sendEmailResult.message);
            throw new Error(sendEmailResult.message);
        }
        res.json(true);
    }));
    /**
     * getReadingsForResource
     *
     * Returns all the readings for a given resource, optionally filtering by type.
     * May need
     */
    const getReadingsForResourceValidation = {
        options: {
            allowUnknownBody: false,
        },
        query: {
            type: Joi.valid('well', 'raingauge', 'checkdam').optional(),
        }
    };
    app.get('/:orgId/:resourceId/reading', validate(getReadingsForResourceValidation), (req, res, next) => {
        const { type } = req.query;
        const { orgId, resourceId } = req.params;
        // // Create a reference to the cities collection
        // var citiesRef = db.collection('cities');
        // // Create a query against the collection
        // var queryRef = citiesRef.where('state', '==', 'CA');
        //TODO: implement optional type filter
        const readingsRef = Firestore_1.default.collection(`/org/${orgId}/reading`)
            .where(`resourceId`, '==', resourceId).get()
            .then(snapshot => {
            const resources = [];
            snapshot.forEach(doc => resources.push(doc.data()));
            res.json(resources);
        })
            .catch(err => next(err));
    });
    /**
     * getResourceNearLocation
     *
     * Returns all the resources near a given location.
     * Basic geoquery, creates a square bounding box (sorry, nothing too fancy here).
     *
     * Currently, the cloudstore database only filters by latitude, and not longitude.
     * So this endpoint queries based on latitude, and then manually filters.
     * See: https://github.com/invertase/react-native-firebase/issues/561,
     *  and https://gist.github.com/zirinisp/e5cf5d9c33cb0bd815993900618eafe0
     *
     * It seems if we want more advanced geo queries, we will have to implement that ourselves. Some people sync
     * their data to Algolia, which allows them to peform these complex queries. That could work in the future,
     * but for now, this will do.
     *
     * @param {number} latitude  - the Latitude of the centre point
     * @param {number} longitude - the Longitude of the centre point
     * @param {float}  distance  - between 0 & 1, how far the search should go. Min x m, Max 10km (approximate)
     */
    const getResourceNearLocationValidation = {
        options: {
            allowUnknownBody: false,
        },
        query: {
            latitude: Joi.number().required(),
            longitude: Joi.number().required(),
            distance: Joi.number().max(1).min(0).required(),
        }
    };
    app.get('/:orgId/nearLocation', validate(getResourceNearLocationValidation), (req, res, next) => __awaiter(this, void 0, void 0, function* () {
        const { latitude, longitude, distance } = req.query;
        const { orgId } = req.params;
        const result = yield FirebaseApi_1.default.resourcesNearLocation(orgId, latitude, longitude, distance);
        if (result.type === AppProviderTypes_1.ResultType.ERROR) {
            next(result.message);
            return;
        }
        res.json(result.result);
    }));
    /* CORS Configuration */
    const openCors = cors({ origin: '*' });
    app.use(openCors);
    /*Error Handling - must be at bottom!*/
    app.use(ErrorHandler_1.default);
    return functions.https.onRequest(app);
};
//# sourceMappingURL=resource.js.map