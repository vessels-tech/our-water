/**
 * Firebase admin middleware
 * 
 * taken from: https://github.com/firebase/functions-samples/blob/master/authorized-https-endpoint/functions/index.js
 */
import { auth } from './common/apis/FirebaseAdmin';
import { SomeResult, makeSuccess, ResultType, makeError } from 'ow_common/lib/utils/AppProviderTypes';
import { auth as fbAuth } from 'firebase-admin';
type DecodedIdToken = fbAuth.DecodedIdToken;


// Express middleware that validates Firebase ID Tokens passed in the Authorization HTTP header.
// The Firebase ID token needs to be passed as a Bearer token in the Authorization HTTP header like this:
// `Authorization: Bearer <Firebase ID Token>`.
// when decoded successfully, the ID Token content will be added as `req.user`.
export const validateFirebaseIdToken = (req, res, next) => {
  console.log('Check if request is authorized with Firebase ID token');
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
    console.log('ID Token correctly decoded', decodedIdToken);
    return makeSuccess(decodedIdToken)
  }).catch((error: Error) => {
    console.error('Error while verifying Firebase ID token:', error);
    
    return makeError<DecodedIdToken>(error.message)
  });

}
