import * as functions from 'firebase-functions';

import {Storage} from '@google-cloud/storage';

type data = {
  deviceId: string,
  filename: string,
  project: string,
  run: string,
  file: string | Buffer
}

const storage = new Storage();

export const uploadFile = functions.https.onCall(async (data: data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'You are not authenticated');
  }

  const bucket = storage.bucket(`projects/${data.project}/runs/${data.run}`).file(data.filename);

  return Promise.all([
    bucket.setMetadata({
      owner: context.auth.uid,
      deviceId: data.deviceId,
    }),
    bucket.save(data.file),
  ]);
});
