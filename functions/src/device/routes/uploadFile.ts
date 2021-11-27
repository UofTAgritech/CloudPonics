import * as functions from 'firebase-functions';

import {Storage} from '@google-cloud/storage';

type FileUploadData = {
  deviceId: string,
  filename: string,
  project: string,
  run: string,
  file: string | Buffer
}

const storage = new Storage();

export const uploadFile = functions.https.onCall(async (data: FileUploadData, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Not authenticated.');
  }
  
  const bucket = storage.bucket(`projects/${data.project}/runs/${data.run}`).file(data.filename);

  // projects/basil/ - accessible by project contributors
  // projects/basil/runs/basil-1394871235 - Accessible by a single device
  // projects/basil/runs/basil-1298678925 - Accessible by a single device

  return bucket.save(data.file);
});
