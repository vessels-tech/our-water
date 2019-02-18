import 'mocha';
import CronUtils from './CronUtils';
// import { getAuthHeader, getToken } from '../tools';
// import { verifyIdToken } from './middleware';
import { unsafeUnwrap, ResultType } from 'ow_common/lib/utils/AppProviderTypes';
import * as assert from 'assert';
import { backupServiceAccountKeyFilename } from '../../common/env';
import { admin } from '../../test/TestFirebase';


import * as prodBackupKey from './.backupServiceAccountKey';
import * as devBackupKey from './.backupServiceAccountKey.development';


//TODO: this runs against the public buckets.
//Skip this test most of the time
describe.skip('CronUtils', function () {
  let backupKey = prodBackupKey;
  if (backupServiceAccountKeyFilename.indexOf('development') > -1) {
    backupKey = devBackupKey;
  }

  it('gets the backups to expire', async () => {
    //Arrange
    const accessToken = "123";
    const backupDate = "1234";

    const storage = admin.storage();
    const query = {
      delimiter: '/'
    };

    //TODO: for some reason, we can't list the files.
    const filesResult = await storage.bucket('our-water-dev').getFiles(query);
    console.log("filesResult", filesResult);


    //Act
    // const expiryList = unsafeUnwrap(await CronUtils.getBackupsToExpire(admin.storage(), accessToken, backupDate));
    

    //Assert

  });

  it('deletes an old backup');
});