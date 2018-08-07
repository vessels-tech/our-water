const assert = require('assert');
const request = require('request-promise-native');

const baseUrl = process.env.BASE_URL;

describe('Array', function () {
  describe('#indexOf()', function () {
    it('should return -1 when the value is not present', function () {
      assert.equal([1, 2, 3].indexOf(4), -1);
    });
  });
});


describe.skip('OrgApi', function () {
  it('should get all orgs', () => {

    const options = {
      method: 'GET',
      uri: `${baseUrl}/org`,
      json: true,
    };

    return request(options)
      .then(response => console.log('res', response))
      .catch(err => {
        console.log('err', err);
        return Promise.reject(err);
      });
  });

  //Cleanup all created resources
  after(function () {
    console.log('cleanup');
  });
});
