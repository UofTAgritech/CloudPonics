import * as functions from 'firebase-functions';

import {Storage} from '@google-cloud/storage';

type data = {
  deviceName: string,
  filename: string,
  file: string | Buffer
}

export const uploadFile = functions.https.onCall(async (data: data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'You are not authenticated');
  }
  const storage = new Storage();
  const bucket = storage.bucket(`${context.auth.uid}/${data.deviceName}`).file(data.filename);
  bucket.save(data.file);
});
