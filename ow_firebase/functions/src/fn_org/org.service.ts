import * as request from 'request-promise';


describe('OrgApi', function () {
  const orgId = process.env.ORG_ID;
  const baseUrl = process.env.BASE_URL;

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
