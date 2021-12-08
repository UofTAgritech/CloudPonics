import * as functions from 'firebase-functions';

import * as iot from '@google-cloud/iot';
import {v4 as uuid} from 'uuid';
import {pki} from 'node-forge';
import {firestore} from 'firebase-admin';

import * as IoT from '../../lib/IoTClient';

type DeviceRegistrationData = {
  name: string
} | null;

export const registerDevice = functions.https.onCall(async (data: DeviceRegistrationData, context) => {
  if (!context.auth || !context.auth.uid) {
    throw new functions.https.HttpsError('unauthenticated', 'Not authenticated.');
  }

  const userdoc = await firestore().doc(`users/${context.auth.uid}`).get();

  if (userdoc.get('devicecount') >= userdoc.get('devicequota')) {
    throw new functions.https.HttpsError('resource-exhausted', 'Device quota exceeded.');
  }

  // Generate unique device identifier
  const deviceid = 'peapod-'+uuid();

  const {privateKey, publicKey} = pki.rsa.generateKeyPair(4096);

  // Build IoT registry device creation request object
  const request : iot.protos.google.cloud.iot.v1.ICreateDeviceRequest = {
    parent: IoT.registryPath,
    device: {
      id: deviceid,
      metadata: {
        owner: context.auth?.uid ?? 'none',
      },
      credentials: [
        {
          publicKey: {
            format: 'RSA_PEM',
            key: pki.publicKeyToPem(publicKey),
          },
        },
      ],
    },
  };

  // Create device
  const [response] = await IoT.IoTClient.createDevice(request);

  await firestore().doc('devices/'+response.id).create({
    owner: context.auth?.uid,
    name: data?.name ?? 'PeaPod',
  });

  await firestore().doc('users/'+context.auth.uid).update({
    devicecount: firestore.FieldValue.increment(1),
  });

  return {id: response.id, name: response.name, privateKey: pki.privateKeyToPem(privateKey)};
});

type DeviceUnregistrationData = {
  deviceid: string
}


export const unregisterDevice = functions.https.onCall(async (data: DeviceUnregistrationData, context) => {
  if (!context.auth || !context.auth.uid) {
    throw new functions.https.HttpsError('unauthenticated', 'Not authenticated.');
  }

  const devicedoc = await firestore().doc(`devices/${data.deviceid}`).get();

  if (!devicedoc.exists) {
    throw new functions.https.HttpsError('invalid-argument', 'Device does not exist');
  }

  if (devicedoc.get('owner') != context.auth.uid) {
    throw new functions.https.HttpsError('permission-denied', 'Permission denied');
  }

  await IoT.IoTClient.deleteDevice({name: IoT.IoTClient.devicePath(
      IoT.gcpproject,
      IoT.cloudregion,
      IoT.registryid,
      data.deviceid
  )});

  await devicedoc.ref.delete();

  await firestore().doc('users/'+context.auth.uid).update({
    devicecount: firestore.FieldValue.increment(-1),
  });
});
