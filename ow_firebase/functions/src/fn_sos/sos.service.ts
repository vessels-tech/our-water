import 'mocha'
import * as assert from 'assert';
import { SOSRequestType, GetFeatureOfInterestRequest, GetFeatureOfInterestRequestFilterType } from './Types';
import SOSApi from '../common/apis/SOSApi';
import { ResultType } from '../common/types/AppProviderTypes';

describe('SOS Handler Service tests', function () {
  it.only('Basic GetFeatureOfInterestRequest', async () => {
    
    //Arrange
    const demoRequest: GetFeatureOfInterestRequest = {
      type: SOSRequestType.GetFeatureOfInterest,
      orgId: 'mywell',
      version: '2.0.0',
      service: 'SOS',
      filter: {
        type: GetFeatureOfInterestRequestFilterType.spatialFilter,
        namespace: 'om:featureOfInterest/*/sams:shape',
        //-116,50.5,-75,51.6,
        lat: 23.5243611111111,
        lng: 73,
        zoom: 0.1,
      }
    }
    const expected = '';
    
    //Act
    const result = await SOSApi.handleRequest(demoRequest);

    if (result.type === ResultType.ERROR) {
      throw new Error(result.message);
    }

    //Assert
    assert.equal(result.result, expected);
  });
});