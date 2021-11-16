import * as functions from 'firebase-functions';

import {Storage} from '@google-cloud/storage';

type data = {
  deviceName: string,
  filename: string,
  file: string | Buffer
}

export const uploadFile = functions.https.onCall(async (data: data, context) => {
  const storage = new Storage();
  const bucket = storage.bucket(data.deviceName).file(data.filename);
  bucket.save(data.file);
});
