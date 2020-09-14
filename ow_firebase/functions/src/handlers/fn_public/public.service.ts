import 'mocha';
import { getAuthHeader, getToken } from '../../../tools';
import { admin, firestore } from '../../test/TestFirebase';
import * as request from 'request-promise-native';

import * as assert from 'assert';
import { UserApi, ReadingApi } from 'ow_common/lib/api';
import { DefaultUser } from 'ow_common/lib/model/User';
import UserType from 'ow_common/lib/enums/UserType';
import { DefaultReading } from 'ow_common/lib/model';
import * as moment from 'moment';
type Firestore = admin.firestore.Firestore;


describe('Public endpoint integration tests', function () {

  this.timeout(5000);
  const orgId = process.env.ORG_ID;
  const baseUrl = process.env.BASE_URL;
  const userApi = new UserApi(firestore, orgId);

  describe('Download QR', function() {
    this.timeout(20000);

    it('downloads the qr code', async () => {
      //Arrange

      //Act
      const options = {
        method: 'GET',
        uri: `${baseUrl}/public/${orgId}/downloadQrCode?id="12345"`,
        json: true,
      };

      //Act
      const response = await request(options);

      //Assert
    });
  });

  describe('Download Readings', function () {
    this.timeout(20000);
    let authHeader;
    const readingApi = new ReadingApi(firestore, orgId);

    this.beforeAll(async () => {
      authHeader = await getAuthHeader(admin);
      await userApi.userRef(orgId, "12345").set({
        ...DefaultUser,
        type: UserType.Admin
      });

      await readingApi.readingCol().doc("reading_001").set({ ...DefaultReading, id: 'reading_001', resourceId: "00001", timeseriesId: 'default' })
      await readingApi.readingCol().doc("reading_002").set({ ...DefaultReading, id: 'reading_002', resourceId: "00001", timeseriesId: 'default' })
      await readingApi.readingCol().doc("reading_003").set({ ...DefaultReading, id: 'reading_003', resourceId: "00002", timeseriesId: 'default' })
      await readingApi.readingCol().doc("reading_004").set({ ...DefaultReading, id: 'reading_004', resourceId: "00002", timeseriesId: 'default' })
      await readingApi.readingCol().doc("reading_005").set({ ...DefaultReading, id: 'reading_005', resourceId: "00003", timeseriesId: 'default' })
      await readingApi.readingCol().doc("reading_006").set({ ...DefaultReading, id: 'reading_006', resourceId: "00003", timeseriesId: 'default' })
      await readingApi.readingCol().doc("reading_007").set({ ...DefaultReading, id: 'reading_007', datetime: moment('2017-01-01T01:11:01Z').toDate(), value: 1, resourceId: "00004", timeseriesId: 'default' })
      await readingApi.readingCol().doc("reading_008").set({ ...DefaultReading, id: 'reading_008', datetime: moment('2017-01-01T01:11:01Z').toDate(), value: 2, resourceId: "00004", timeseriesId: 'default' })
      await readingApi.readingCol().doc("reading_009").set({ ...DefaultReading, id: 'reading_009', datetime: moment('2017-01-01T01:11:01Z').toDate(), value: 3, resourceId: "00004", timeseriesId: 'default' })
    });

    it('downloads the readings for multiple resourceIds', async () => {
      //Arrange
      const resourceIds = encodeURIComponent('00001,00002,00003');
      const options = {
        method: 'GET',
        uri: `${baseUrl}/public/${orgId}/downloadReadings?resourceIds=${resourceIds}`,
        json: true,
        headers: {
          ...authHeader,
        }
      };

      //Act
      const response = await request(options);

      //Assert - we expect 6 readings, with one newline at end
      assert.equal(response.split('\n').length, 7);
    });

    it('downloads the readings for just one resourceId', async () => {
      //Arrange
      const resourceIds = encodeURIComponent('00001');
      const options = {
        method: 'GET',
        uri: `${baseUrl}/public/${orgId}/downloadReadings?resourceIds=${resourceIds}`,
        json: true,
        headers: {
          ...authHeader,
        }
      };

      //Act
      const response = await request(options);

      //Assert - we expect 6 readings, with one newline at end
      assert.equal(response.split('\n').length, 3);
    });

    it('Fails with a 404 if no readings could be found', async () => {
      //Arrange
      const resourceIds = encodeURIComponent('00010');
      const options = {
        method: 'GET',
        uri: `${baseUrl}/public/${orgId}/downloadReadings?resourceIds=${resourceIds}`,
        json: true,
        headers: {
          ...authHeader,
        }
      }

      //Act
      let statusCode;
      try {
        const response = await request(options);
      } catch (err) {
        statusCode = err.statusCode;
      }

      //Assert
      assert.equal(statusCode, 404);
    });


    this.afterAll(async () => {
      await readingApi.readingCol().doc("reading_001").delete();
      await readingApi.readingCol().doc("reading_002").delete();
      await readingApi.readingCol().doc("reading_003").delete();
      await readingApi.readingCol().doc("reading_004").delete();
      await readingApi.readingCol().doc("reading_005").delete();
      await readingApi.readingCol().doc("reading_006").delete();
      await readingApi.readingCol().doc("reading_007").delete();
      await readingApi.readingCol().doc("reading_008").delete();
      await readingApi.readingCol().doc("reading_009").delete();
    });
  });

  describe('Download Reading Images', function () {
    this.timeout(20000);
    let authHeader;
    const readingApi = new ReadingApi(firestore, orgId);

    this.beforeAll(async () => {
      authHeader = await getAuthHeader(admin);
      await userApi.userRef(orgId, "12345").set({
        ...DefaultUser,
        type: UserType.Admin
      });

      const base64Image = "iVBORw0KGgoAAAANSUhEUgAAACoAAAAiCAYAAAApkEs2AAAMJmlDQ1BJQ0MgUHJvZmlsZQAASImVlwdUk8kWgOcvqSS0QASkhN4EKdKl1wgCUgUbIQkklBgSgogdWVRwLaiIYEVXRWxrAWSxYS + LYO8PRVCUdbFgQ + VNEkBXz3vvvHvO / P + XO3fu3Hsz / 5wZANSiOWJxFqoOQLYoVxITGsCamJTMInUABKBAA + iD0RyuVOwfHR0BoAy9 / ynvbkJrKNfs5L5 + 7v + vosHjS7kAINGQU3lSbjbkQwDgrlyxJBcAQg / Um87IFUMmwiiBlgQGCNlMzulKdpdzqpIjFDZxMYGQUwAg0zgcSToAqvK4WHncdOhHdSlkBxFPKILcBNmHK + DwIH + GPCo7ezpkNSvIVqnf + Un / h8 / UYZ8cTvowK3NRCDlIKBVncWb + n + X435KdJRuawxQ2mkASFiPPWV63zOnhcqZBPi9KjYyCrAn5upCnsJdzl0AWFj9o / 4ErDYQ1A0wAUBqPExQOWR + yiSgrMmJQ75MmDGFDhrVH44S57DjlWJQnmR4z6B / N50uDY4eYI1HMJbcpkWXG + w / 63Cjgs4d8NhYI4hKVcaKtecKESMiqkO9LM2PDB22eFwgCI4dsJLIYeczwP8dAmiQkRmmDmWVLh / LCPAVCduQgR + QK4sKUY7GpXI4iNh3IGXzpxIihOHn8oGBlXlghXxQ / GD9WJs4NiBm03ybOih60x5r4WaFyvQnkFmle7NDY3ly42JT54kCcGx2njA3XyuCMi1bGgNuACBAIggALyGBLBdNBBhC29NT3wF / KnhDAARKQDvjAblAzNCJR0SOCz1hQAP6CxAfS4XEBil4 + yIP6L8Na5dMOpCl68xQjMkEX5GwQDrLgb5lilGh4tgTwBGqEP83OhbFmwSbv + 0nHUhvSEYOJQcQwYgjRGtfDfXAvPAI + /WBzwt1xj6G4vtkTughthMeEG4R2wp1pwkLJD5GzwHjQDmMMGcwu9fvscAvo1QUPwL2hf+gbZ+J6wA4fA2fyx33h3C5Q+32ssuGMv9Vy0BfFgYJSRlD8KFY/RqBqo + oy7EVeqe9roYwrdbhagcM9P + YR + F39ePAd / qMlthg7iJ3DTmIXsCasHrCw41gDdhk7KufhtfFEsTaGZotRxJMJ / Qh / mo8zOKe8alKHWoduh8 + DfSCXn58r / 1gCp4tnSoTpglyWP9yt + Sy2iGs / iuXk4OgBgHzvV24tb5iKPR1hXvymyzkBgEcJVKZ / 03HgHnSkCwDGu28609dw2a8A4GgrVybJU + pw + YMAqEANfim6wBDuXVYwIyfgCryAHwgG40AUiANJYCqsswCuUwmYAWaDBaAYlIIVYA2oBJvAVrAT7AEHQD1oAifBWXAJtIIb4B5cK53gBegF70A / giAkhI4wEF3ECDFHbBEnxB3xQYKRCCQGSUJSkHREhMiQ2chCpBQpQyqRLUgN8jtyBDmJXEDakDvII6QbeY18QjGUhmqhBqgFOhp1R / 3RcDQOnYKmozloAVqELkMr0Gp0N1qHnkQvoTfQdvQF2ocBTAVjYsaYHeaOBWJRWDKWhkmwuVgJVo5VY3uxRvhPX8PasR7sI07EGTgLt4PrNQyPx7l4Dj4XX4pX4jvxOvw0fg1 / hPfiXwl0gj7BluBJYBMmEtIJMwjFhHLCdsJhwhn47XQS3hGJRCbRkugGv70kYgZxFnEpcQNxH / EEsY3YQewjkUi6JFuSNymKxCHlkopJ60i7ScdJV0mdpA9kFbIR2YkcQk4mi8iF5HLyLvIx8lXyU3I / RZ1iTvGkRFF4lJmU5ZRtlEbKFUonpZ + qQbWkelPjqBnUBdQK6l7qGep96hsVFRUTFQ + VCSpClfkqFSr7Vc6rPFL5SNOk2dACaZNpMtoy2g7aCdod2hs6nW5B96Mn03Ppy + g19FP0h / QPqgxVe1W2Kk91nmqVap3qVdWXahQ1czV / talqBWrlagfVrqj1qFPULdQD1Tnqc9Wr1I + o31Lv02BoOGpEaWRrLNXYpXFB45kmSdNCM1iTp1mkuVXzlGYHA2OYMgIZXMZCxjbGGUanFlHLUoutlaFVqrVHq0WrV1tTe4x2gna + dpX2Ue12Jsa0YLKZWczlzAPMm8xPIwxG + I / gj1gyYu + IqyPe64zU8dPh65To7NO5ofNJl6UbrJupu1K3XveBHq5nozdBb4beRr0zej0jtUZ6jeSOLBl5YORdfVTfRj9Gf5b + Vv3L + n0GhgahBmKDdQanDHoMmYZ + hhmGqw2PGXYbMYx8jIRGq42OGz1nabP8WVmsCtZpVq + xvnGYscx4i3GLcb + JpUm8SaHJPpMHplRTd9M009Wmzaa9ZkZm481mm9Wa3TWnmLubC8zXmp8zf29haZFoscii3uKZpY4l27LAstbyvhXdytcqx6ra6ro10drdOtN6g3WrDWrjYiOwqbK5YovautoKbTfYto0ijPIYJRpVPeqWHc3O3y7PrtbukT3TPsK + 0L7e / uVos9HJo1eOPjf6q4OLQ5bDNod7jpqO4xwLHRsdXzvZOHGdqpyuO9OdQ5znOTc4vxpjO4Y / ZuOY2y4Ml / Eui1yaXb64urlKXPe6druZuaW4rXe75a7lHu2 + 1P28B8EjwGOeR5PHR09Xz1zPA55 / e9l5ZXrt8no21nIsf + y2sR3eJt4c7y3e7T4snxSfzT7tvsa + HN9q38d + pn48v + 1 + T / 2t / TP8d / u / DHAIkAQcDngf6Bk4J / BEEBYUGlQS1BKsGRwfXBn8MMQkJD2kNqQ31CV0VuiJMEJYeNjKsFtsAzaXXcPuHec2bs640 + G08NjwyvDHETYRkojG8ej4ceNXjb8faR4piqyPAlHsqFVRD6Ito3Oi / 5hAnBA9oWpCV4xjzOyYc7GM2Gmxu2LfxQXELY + 7F28VL4tvTlBLmJxQk / A + MSixLLF94uiJcyZeStJLEiY1JJOSE5K3J / dNCp60ZlLnZJfJxZNvTrGckj / lwlS9qVlTj05Tm8aZdjCFkJKYsivlMyeKU83pS2Wnrk / t5QZy13Jf8Px4q3ndfG9 + Gf9pmndaWdqzdO / 0VendAl9BuaBHGCisFL7KCMvYlPE + MypzR + ZAVmLWvmxydkr2EZGmKFN0errh9PzpbWJbcbG4PcczZ01OryRcsl2KSKdIG3K14CH7ssxK9ovsUZ5PXlXehxkJMw7ma + SL8i / PtJm5ZObTgpCC32bhs7izmmcbz14w + 9Ec / zlb5iJzU + c2zzOdVzSvc37o / J0LqAsyF / xZ6FBYVvh2YeLCxiKDovlFHb + E / lJbrFosKb61yGvRpsX4YuHiliXOS9Yt + VrCK7lY6lBaXvp5KXfpxV8df634dWBZ2rKW5a7LN64grhCtuLnSd + XOMo2ygrKOVeNX1a1mrS5Z / XbNtDUXyseUb1pLXStb214RUdGwzmzdinWfKwWVN6oCqvat11 + /ZP37DbwNVzf6bdy7yWBT6aZPm4Wbb28J3VJXbVFdvpW4NW9r17aEbed+c/ + tZrve9tLtX3aIdrTvjNl5usatpmaX / q7ltWitrLZ79 + TdrXuC9jTstdu7ZR9zX + l + sF + 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";
      await readingApi.readingCol().doc("image_reading_001").set({ ...DefaultReading, id: 'reading_001', resourceId: "00001", timeseriesId: 'default', image: {url: base64Image} })
      await readingApi.readingCol().doc("image_reading_002").set({ ...DefaultReading, id: 'reading_002', resourceId: "00001", timeseriesId: 'timeseries_2', image: { url: base64Image} })
      await readingApi.readingCol().doc("image_reading_003").set({ ...DefaultReading, id: 'reading_003', resourceId: "00002", timeseriesId: 'default' })
    });

    it('only downloads images for one resource at a time', async () => {
      //Arrange
      const resourceIds = encodeURIComponent('00001,00002,00003');
      const options = {
        method: 'GET',
        uri: `${baseUrl}/public/${orgId}/downloadReadingImages?resourceId=${resourceIds}`,
        json: true,
        headers: {
          ...authHeader,
        }
      };

      //Act
      let statusCode;
      try {
        await request(options);
      } catch (err) {
        statusCode = err.statusCode;
      }

      assert.strictEqual(statusCode, 400);
    });

    it('downloads the reading images as a zip file of pngs', async () => {
      //Arrange
      const resourceIds = encodeURIComponent('00001');
      const options = {
        method: 'GET',
        uri: `${baseUrl}/public/${orgId}/downloadReadingImages?resourceId=${resourceIds}`,
        json: false,
        headers: {
          ...authHeader,
        }
      };

      //Act
      await request(options);
      
      //Assert
      //TD No assert, just check manually for now
    });

    it('Fails with a 404 if no readings with images could be found', async () => {
      //Arrange
      const resourceIds = encodeURIComponent('00010');
      const options = {
        method: 'GET',
        uri: `${baseUrl}/public/${orgId}/downloadReadingImages?resourceId=00002`,
        json: true,
        headers: {
          ...authHeader,
        }
      }

      //Act
      let statusCode;
      try {
        const response = await request(options);
      } catch (err) {
        statusCode = err.statusCode;
      }

      //Assert
      assert.strictEqual(statusCode, 404);
    });

    this.afterAll(async () => {
      await readingApi.readingCol().doc("image_reading_001").delete();
      await readingApi.readingCol().doc("image_reading_002").delete();
      await readingApi.readingCol().doc("image_reading_003").delete();
    });
  });
});