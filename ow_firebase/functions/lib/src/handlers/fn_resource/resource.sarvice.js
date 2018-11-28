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
require("mocha");
const request = require("request-promise-native");
const ow_types_1 = require("ow_types");
const tools_1 = require("../../../tools");
describe('fn_resource', function () {
    const orgId = process.env.ORG_ID;
    const baseUrl = process.env.BASE_URL;
    let authHeader;
    describe('ggmnResourceEmail', function () {
        this.timeout(5000);
        before(function () {
            return __awaiter(this, void 0, void 0, function* () {
                authHeader = yield tools_1.getAuthHeader(admin);
            });
        });
        it.only('sends the resource email', () => __awaiter(this, void 0, void 0, function* () {
            //Arrange
            const pendingResources = [
                {
                    type: ow_types_1.OrgType.NONE,
                    id: '12345',
                    pending: true,
                    coords: { latitude: 123, longitude: 23 },
                    resourceType: ow_types_1.ResourceType.checkdam,
                    owner: { name: 'Lewis' },
                    userId: '12345',
                    timeseries: [],
                },
                {
                    type: ow_types_1.OrgType.NONE,
                    id: '12346',
                    pending: true,
                    coords: { latitude: 123, longitude: 23 },
                    resourceType: ow_types_1.ResourceType.checkdam,
                    owner: { name: 'Lewis' },
                    userId: '12346',
                    timeseries: [],
                },
            ];
            const body = {
                "email": "lewisdsdasdaly@me.com",
                pendingResources,
            };
            const options = Object.assign({ method: 'POST', uri: `${baseUrl}/resource/${orgId}/ggmnResourceEmail`, json: true, body }, authHeader);
            //Act
            const response = yield request(options);
            console.log('response', response);
            //Assert
        }));
    });
});
//# sourceMappingURL=resource.sarvice.js.map