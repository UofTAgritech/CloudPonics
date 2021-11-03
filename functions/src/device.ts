import * as functions from 'firebase-functions';

import * as iot from '@google-cloud/iot';
import {v4 as uuid} from 'uuid';
import {pki} from 'node-forge';

// Found at https://console.cloud.google.com/iot/registries
const gcpproject = 'cloudponics-bc383';
const cloudregion = 'us-central1';
const registryid = 'CloudPonics';

const iotClient = new iot.DeviceManagerClient();

type DeviceRegistrationData = {
    // Nothing yet
}

export const registerDevice = functions.https.onCall(async (data: DeviceRegistrationData, context) => {
  // TODO: Check preconditions
  // - Auth state
  // - Data fields non-empty
  // - User quota not yet met

  // Generate unique device identifier
  const deviceid = 'peapod-'+uuid();

  const {privateKey, publicKey} = pki.rsa.generateKeyPair(4096);

  // Build registry path
  const registryPath = iotClient.registryPath(gcpproject, cloudregion, registryid);

  // Build IoT registry device creation request object
  const request : iot.protos.google.cloud.iot.v1.ICreateDeviceRequest = {
    parent: registryPath,
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
  const [response] = await iotClient.createDevice(request);

  return {id: response.id, name: response.name, privateKey: pki.privateKeyToPem(privateKey)};
});
