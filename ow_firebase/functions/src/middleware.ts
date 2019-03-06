/**
 * Firebase admin middleware
 * 
 * taken from: https://github.com/firebase/functions-samples/blob/master/authorized-https-endpoint/functions/index.js
 */
import { auth, firestore } from './common/apis/FirebaseAdmin';
import { SomeResult, makeSuccess, ResultType, makeError, resultsHasError } from 'ow_common/lib/utils/AppProviderTypes';
import { auth as fbAuth } from 'firebase-admin';
import { UserApi } from 'ow_common/lib/api';
import { User } from 'ow_common/lib/model/User';
import UserType from 'ow_common/lib/enums/UserType';
import { unsafelyGetOrgId, get } from './common/utils';
import { temporaryAdminAccessToken, temporaryAdminUserId } from './common/env';
type DecodedIdToken = fbAuth.DecodedIdToken;


// Express middleware that validates Firebase ID Tokens passed in the Authorization HTTP header.
// The Firebase ID token needs to be passed as a Bearer token in the Authorization HTTP header like this:
// `Authorization: Bearer <Firebase ID Token>`.
// when decoded successfully, the ID Token content will be added as `req.user`.
export const validateFirebaseIdToken = (req, res, next) => {
  //Allow a master token to be used to get through the authentication.
  const insecureToken = get(req, ['headers', 'insecure_token']);
  if (insecureToken && insecureToken !== temporaryAdminAccessToken) {
    console.warn("Found invalid insecure token.");
    res.status(403).send('Unauthorized');
    return;
  }

  console.log("insecure token is", insecureToken);

  if (insecureToken) {
    console.warn("Using insecure access token. This should be replaced");
    req.user = { uid: temporaryAdminUserId };
    return next();
  }

  const validateResult = getIdToken(req);
  if (validateResult.type === ResultType.ERROR) {
    res.status(403).send('Unauthorized');
    return;
  }
  const idToken = validateResult.result;

  return verifyIdToken(idToken)
    .then(result => {
      if (result.type === ResultType.ERROR) {
        res.status(403).send('Unauthorized');
        return;
      }

      req.user = result.result;
      console.log("user is", result.result);
      return next();
    });
};


/**
 * validateUserIsAdmin
 * 
 * Middleware that looks up the user object, and ensures they are an administrator!
 * Assumes you are using with validateFirebaseIdToken to inject the user Id, otherwise 
 * req.user will be null
 * 
 * @param req 
 * @param res 
 * @param next 
 */
export const validateUserIsAdmin = (req, res, next) => {
  const userId = get(req, ['user', 'uid']);
  if (!userId) {
    console.warn("No user found on req object. You should be using validateFirebaseIdToken middleware before this middleware.");
    res.status(403).send('Unauthorized');
    return;
  }

  console.log("req.params", req.originalUrl);

  const orgId = unsafelyGetOrgId(req.originalUrl);
  if (!orgId) {
    console.warn("No orgId found on req.params.");
    res.status(400).send('Could not find orgId on request params');
    return;
  }

  const userApi = new UserApi(firestore, orgId);
  return getIsUserAdmin(userApi, orgId, userId)
  .then((result) => {
    if (result.type === ResultType.ERROR) {
      res.status(403).send('Unauthorized');
      return;
    }

    return next();
  })
  .catch((err: Error) => {
    res.status(403).send('Unauthorized');
    return;
  });
}


export async function getIsUserAdmin(userApi: UserApi, orgId: string, userId: string): Promise<SomeResult<void>> {
  const userResult = await userApi.getUser(userApi.userRef(orgId, userId));
  if (userResult.type === ResultType.ERROR) {
    return makeError<void>(userResult.message);
  }

  if (userResult.result.type !== UserType.Admin) {
    return makeError<void>('User is not admin.');
  }

  return makeSuccess(undefined);
}

/**
 * getIdToken
 * 
 * Ensures that the required token is present in the Auth header 
 * or session cookie
 * 
 * @returns: SuccessResult<idToken> | ErrorResult
 */
export function getIdToken(req): SomeResult<string> {
  if ((!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) &&
    !(req.cookies && req.cookies.__session)) {
    console.error('No Firebase ID token was passed as a Bearer token in the Authorization header.',
      'Make sure you authorize your request by providing the following HTTP header:',
      'Authorization: Bearer <Firebase ID Token>',
      'or by passing a "__session" cookie.');
    return makeError('No ID token found');
  }

  let idToken;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    console.log('Found "Authorization" header');
    // Read the ID Token from the Authorization header.
    idToken = req.headers.authorization.split('Bearer ')[1];
  } else if (req.cookies) {
    console.log('Found "__session" cookie');
    // Read the ID Token from cookie.
    idToken = req.cookies.__session;
  } else {
    // No cookie
    return makeError('No ID token found');
  }

  return makeSuccess(idToken);
}

export function verifyIdToken(token: string): Promise<SomeResult<DecodedIdToken>> {

  return auth.verifyIdToken(token)
    .then((decodedIdToken: DecodedIdToken) => {
    console.log('ID Token correctly decoded');
    return makeSuccess(decodedIdToken)
  }).catch((error: Error) => {
    console.error('Error while verifying Firebase ID token.', error.message);
    
    return makeError<DecodedIdToken>(error.message)
  });

}
